require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const WebSocket = require('ws');
const { message, createDataItemSigner } = require('@permaweb/aoconnect');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const rateLimit = require('express-rate-limit');
const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');

const sentMessages = new Set();
const MESSAGE_EXPIRATION_TIME = 60000;

const botSecret = process.env.DISCORD_BOT_TOKEN;
const discordChannelId = process.env.DISCORD_CHANNEL_ID;
const weatherApiKey = process.env.OPENWEATHER_API_KEY;
const coinApiKey = process.env.COINAPI_API_KEY;
const aosWalletPath = process.env.AOS_WALLET_PATH;
const aosPid = process.env.AOS_PID;

if (!botSecret || !discordChannelId || !weatherApiKey || !coinApiKey || !aosWalletPath || !aosPid) {
  console.error('🚨 Missing required environment variables.');
  process.exit(1);
}

const walletData = JSON.parse(readFileSync(aosWalletPath).toString());

const LANGUAGE_FILE_PATH = path.join(__dirname, 'userLanguage.json');
let userLanguage = {};

function saveUserPreferences() {
  writeFileSync(LANGUAGE_FILE_PATH, JSON.stringify(userLanguage, null, 2));
}

function loadUserPreferences() {
  try {
    if (existsSync(LANGUAGE_FILE_PATH)) {
      const data = readFileSync(LANGUAGE_FILE_PATH);
      userLanguage = data.length > 0 ? JSON.parse(data) : {};
    }
  } catch (error) {
    console.error('Error loading user language preferences:', error);
    userLanguage = {};
  }
}

loadUserPreferences();

const rateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1500,
  message: 'You have exceeded the 1500 requests in 10 minutes limit. Try again later.',
  headers: true,
});

app.use(rateLimiter);

app.listen(8081, () => {
  console.log('Rate limiter server running on port 8081');
});

async function forwardMessageToInitRoom(messageData, lang = 'en') {
  const user = messageData.author.username;
  const content = messageData.content;

  if (user === 'RelayBot' || messageData._fromDevChat || sentMessages.has(content)) {
    return;
  }

  try {
    const signer = await createDataItemSigner(walletData);
    await message({
      process: aosPid,
      tags: [
        { name: 'Action', value: 'Beam to Getting-Started' },
        { name: 'Content', value: content },
        { name: 'Sender', value: user },
        { name: 'Language', value: lang },
        { name: 'FromAOS', value: 'true' }
      ],
      signer,
      data: content,
    });

    console.log('Message sent to AOS:', content);

    sentMessages.add(content);
    setTimeout(() => {
      sentMessages.delete(content);
    }, MESSAGE_EXPIRATION_TIME);
  } catch (error) {
    console.error('Error beaming message to Getting-Started:', error);
  }
}

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

discordClient.once('ready', () => {
  console.log(`Discord bot logged in as ${discordClient.user.tag}`);
  initializeWebSocketServer();
});

discordClient.login(botSecret).catch(error => {
  console.error('Error logging in to Discord:', error);
});

function initializeWebSocketServer() {
  const wsServer = new WebSocket.Server({ port: 8080 });

  wsServer.on('connection', ws => {
    console.log('WebSocket connection established.');

    ws.on('message', incomingMessage => {
      const parsedMessage = JSON.parse(incomingMessage.toString());
      const messageContent = parsedMessage.content;
      const command = parsedMessage.command;
      const lang = parsedMessage.lang || 'en';
      const userId = parsedMessage.userId;

      const channel = discordClient.channels.cache.get(discordChannelId);
      if (channel) {
        if (command === '!joke' || command === '!quote' || command.startsWith('!price')) {
          handleCommand(command, channel, lang, userId);
        } else if (command === '!setlang') {
          if (lang === 'en' || lang === 'tr') {
            userLanguage[userId] = lang;
            saveUserPreferences();
            channel.send(`Language set to ${lang === 'en' ? 'English' : 'Turkish'}`);
          } else {
            channel.send('Invalid language. Use !setlang en or !setlang tr');
          }
        } else if (command === '!weather') {
          handleWeatherCommand(channel);
        } else {
          if (!sentMessages.has(messageContent)) {
            channel.send(messageContent)
              .then(() => {
                console.log('Sending message to AOS:', messageContent);
                forwardMessageToInitRoom({ author: { username: 'RelayBot' }, content: messageContent, _fromDevChat: true }, lang);
              })
              .catch(console.error);
          }
        }
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed.');
    });
  });

  console.log('WebSocket server started on port 8080');
}

async function handleWeatherCommand(channel) {
  const weatherMessage = await fetchWeather();
  channel.send(weatherMessage);
}

async function fetchWeather() {
  const city = "Antarctica";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    const temp = response.data.main.temp;
    const feelsLike = response.data.main.feels_like;
    const weatherDescription = response.data.weather[0].description;
    const windSpeed = response.data.wind.speed;
    return `**The current temperature in ${city} is ${temp}°C. Feels like ${feelsLike}°C. ${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}. Wind speed: ${windSpeed} m/s.**`;
  } catch (error) {
    return '**Failed to fetch weather data.**';
  }
}

async function fetchCryptoPrice(coin) {
  const url = `https://rest.coinapi.io/v1/exchangerate/${coin}/USD`;
  const headers = {
    'X-CoinAPI-Key': coinApiKey
  };

  try {
    const response = await axios.get(url, { headers });
    const price = response.data.rate;
    return `**The current price of ${coin} is $${price.toFixed(2)}.**`;
  } catch (error) {
    return `**Failed to fetch ${coin} price.**`;
  }
}

function handleCommand(command, channel, lang, userId) {
  const userLang = userLanguage[userId] || lang;

  if (command === '!joke') {
    const jokes = {
      en: [
        "Why don't blockchain developers go out much? They like to stay at chain home!",
        "How do you make a small fortune in crypto? Start with a large one!"
      ],
      tr: [
        "Blockchain geliştiricileri neden çok dışarı çıkmaz? Zincir evde kalmayı tercih ederler!",
        "Kripto para ile nasıl küçük bir servet yapılır? İlk olarak büyük bir servetle başlarsınız!"
      ]
    };
    const joke = jokes[userLang][Math.floor(Math.random() * jokes[userLang].length)];
    channel.send(`**${joke}**`);
  }

  if (command === '!quote') {
    const quotes = {
      en: [
        "Blockchain is the tech. Bitcoin is merely the first mainstream manifestation of its potential. - Marc Kenigsberg",
        "Blockchain will do to the financial system what the internet did to media. - Joichi Ito"
      ],
      tr: [
        "Blockchain, teknolojinin ta kendisidir. Bitcoin, bu potansiyelinin yalnızca ilk ana akım tezahürüdür. - Marc Kenigsberg",
        "Blockchain, finansal sisteme internetin medyaya yaptığını yapacak. - Joichi Ito"
      ]
    };
    const quote = quotes[userLang][Math.floor(Math.random() * quotes[userLang].length)];
    channel.send(`**${quote}**`);
  }

  if (command.startsWith('!price')) {
    const [, coin] = command.split(' ');
    if (coin) {
      fetchCryptoPrice(coin.toUpperCase()).then(priceMessage => {
        channel.send(priceMessage);
      }).catch(err => {
        channel.send('**Failed to fetch price.**');
      });
    } else {
      channel.send('**Please specify a coin (e.g., !price btc).**');
    }
  }
}

discordClient.on('messageCreate', async message => {
  if (message.author.bot) return;

  const userId = message.author.id;

  if (message.content.startsWith('!setlang')) {
    const [, lang] = message.content.split(' ');
    if (lang === 'en' || lang === 'tr') {
      userLanguage[userId] = lang;
      saveUserPreferences();
      message.channel.send(`Language set to ${lang === 'en' ? 'English' : 'Turkish'}`);
      forwardMessageToInitRoom(message, lang);
    } else {
      message.channel.send('Invalid language. Use !setlang en or !setlang tr');
    }
    return;
  }

  const lang = userLanguage[userId] || 'en';

  if (message.content === '!joke' || message.content === '!quote' || message.content.startsWith('!price')) {
    handleCommand(message.content, message.channel, lang, userId);
  } else {
    if (!sentMessages.has(message.content)) {
      console.log('Forwarding message to AOS:', message.content);
      forwardMessageToInitRoom(message, lang);
    }
  }
});

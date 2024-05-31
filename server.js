require('dotenv').config(); // Load environment variables
const { Client, GatewayIntentBits } = require('discord.js');
const WebSocket = require('ws');
const { message, createDataItemSigner } = require('@permaweb/aoconnect');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const rateLimit = require('express-rate-limit');
const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');

// Configuration
const botToken = process.env.DISCORD_BOT_TOKEN; //// Discord bot Token
const discordChannelId = process.env.DISCORD_CHANNEL_ID; // Discord channel ID
const openWeatherApiKey = process.env.OPENWEATHER_API_KEY; // OpenWeather API Key

if (!botToken) {
  console.error('🚨 Uh-oh! DISCORD_BOT_TOKEN is not defined in the .env file.');
  process.exit(1);
}

if (!discordChannelId) {
  console.error('🚨 Yikes! DISCORD_CHANNEL_ID is not defined in the .env file.');
  process.exit(1);
}

const walletFilePath = '/root/.aos.json'; // Wallet file path
const walletData = JSON.parse(readFileSync(walletFilePath).toString());

// Load and save user language preferences
const LANGUAGE_FILE_PATH = path.join(__dirname, 'userLanguage.json');
let userLanguage = {};

function saveUserLanguagePreferences() {
  writeFileSync(LANGUAGE_FILE_PATH, JSON.stringify(userLanguage, null, 2));
}

function loadUserLanguagePreferences() {
  try {
    if (existsSync(LANGUAGE_FILE_PATH)) {
      const data = readFileSync(LANGUAGE_FILE_PATH);
      if (data.length > 0) {
        userLanguage = JSON.parse(data);
      } else {
        userLanguage = {};
      }
    }
  } catch (error) {
    console.error('Error loading user language preferences:', error);
    userLanguage = {};
  }
}

loadUserLanguagePreferences(); // Load preferences on startup

// Setup express rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5000, // Limit each IP to 5000 requests per windowMs
  message: '🚀 Whoa there, space cowboy! You have exceeded the 5000 requests in 10 minutes limit. Take a breather and try again soon!',
  headers: true,
});

app.use(limiter);

app.listen(8081, () => {
  console.log('🌌 Rate limiter server running on port 8081');
});

async function forwardMessageToInterstellarChat(messageData, lang = 'en') {
  const user = messageData.author.username;
  const content = messageData.content;

  // If the message is from RelayBot or DevChat, don't forward it again
  if (user === 'RelayBot' || messageData._fromDevChat) {
    return;
  }

  console.log(`✨ Preparing to teleport message from ${user} to InterstellarChat! 🚀`);
  console.log(`📝 Message content: ${content}`); // Log the message content

  try {
    const signer = await createDataItemSigner(walletData);
    const response = await message({
      process: 'NAFg0T-grGsqyV1neCV9nPwbNU5d5qXx0ZCpoxmClh8',
      tags: [
        { name: 'Action', value: 'BeamToInterstellarChat' },
        { name: 'Content', value: content },
        { name: 'Sender', value: user }, // User name tag added here
        { name: 'Language', value: lang }, // Add language tag
      ],
      signer,
      data: content,
    });
    console.log('🌟 Message successfully beamed to InterstellarChat:', response);
  } catch (error) {
    console.error('💥 Oops! Error beaming message to InterstellarChat:', error);
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
  console.log(`🚀 Discord bot logged in as ${discordClient.user.tag}! Let's get this cosmic party started! 🎉`);
  initiateWebSocketServer();
});

discordClient.login(botToken).catch(console.error);

function initiateWebSocketServer() {
  const wsServer = new WebSocket.Server({ port: 8080 });

  wsServer.on('connection', ws => {
    console.log('🌐 WebSocket connection established. Ready to receive transmissions!');

    ws.on('message', incomingMessage => {
      const parsedMessage = JSON.parse(incomingMessage.toString());
      const messageContent = parsedMessage.content;
      const command = parsedMessage.command;
      const lang = parsedMessage.lang || 'en';
      const userId = parsedMessage.userId || 'aos-term'; // Default userId to 'aos-term' if not provided

      console.log('📡 Incoming transmission:', messageContent);

      const channel = discordClient.channels.cache.get(discordChannelId);
      if (channel) {
        if (command === '!joke' || command === '!quote') {
          handleCommand(command, channel, lang, userId);
        } else if (command === '!setlang') {
          console.log(`🌐 Received !setlang command: ${lang}`);
          if (lang === 'en' || lang === 'tr') {
            userLanguage[userId] = lang;
            saveUserLanguagePreferences();
            channel.send(`Language set to ${lang === 'en' ? 'English' : 'Turkish'}`);
          } else {
            channel.send('Invalid language. Use !setlang en or !setlang tr');
          }
        } else if (command === '!weather') {
          handleWeatherCommand(channel);
        } else if (command.startsWith('!price')) {
          const [, coin] = command.split(' ');
          if (coin) {
            fetchCryptoPrice(coin.toUpperCase()).then(priceMessage => {
              channel.send(priceMessage);
            }).catch(err => {
              console.error('Error fetching crypto price:', err);
              channel.send('Failed to fetch price.');
            });
          } else {
            channel.send('Please specify a coin (e.g., !price btc).');
          }
        } else {
          channel.send(messageContent)
            .then(() => {
              console.log('📤 Message sent to Discord');
              forwardMessageToInterstellarChat({ author: { username: 'RelayBot' }, content: messageContent, _fromDevChat: true }, lang);
            })
            .catch(console.error);
        }
      } else {
        console.error('❌ Oops! Discord channel not found.');
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket connection closed. Awaiting new transmissions.');
    });
  });

  console.log('🌌 WebSocket server started on port 8080. Ready for cosmic communication! 🚀');
}

async function handleWeatherCommand(channel) {
  const weatherMessage = await fetchWeather();
  channel.send(weatherMessage);
}

async function fetchWeather() {
  const apiKey = process.env.OPENWEATHER_API_KEY; // Ensure this is set in your .env file
  const city = "Antarctica";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    const temp = response.data.main.temp;
    const feelsLike = response.data.main.feels_like;
    const weatherDescription = response.data.weather[0].description;
    const windSpeed = response.data.wind.speed;
    return `**The current temperature in ${city} is ${temp}°C. Feels like ${feelsLike}°C. ${capitalizeFirstLetter(weatherDescription)}. Wind speed: ${windSpeed} m/s.**`;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return 'Failed to fetch weather data.';
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function fetchCryptoPrice(coin) {
  const apiKey = process.env.COINAPI_API_KEY;
  const url = `https://rest.coinapi.io/v1/exchangerate/${coin}/USD`;
  const headers = {
    'X-CoinAPI-Key': apiKey
  };

  try {
    const response = await axios.get(url, { headers });
    const price = response.data.rate;
    return `**The current price of ${coin} is $${price.toFixed(2)}.**`;
  } catch (error) {
    console.error(`Failed to fetch ${coin} price:`, error);
    return `Failed to fetch ${coin} price.`;
  }
}

function handleCommand(command, channel, lang, userId) {
  const userLang = userLanguage[userId] || lang;

  if (command === '!joke') {
    const jokes = {
      en: [
        "Why don't blockchain developers go out much? They like to stay at chain home! 😄",
        "How do you make a small fortune in crypto? Start with a large one! 💸"
      ],
      tr: [
        "Blockchain geliştiricileri neden çok dışarı çıkmaz? Zincir evde kalmayı tercih ederler! 😄",
        "Kripto para ile nasıl küçük bir servet yapılır? İlk olarak büyük bir servetle başlarsınız! 💸"
      ]
    };
    const joke = jokes[userLang][Math.floor(Math.random() * jokes[userLang].length)];
    const modifiedJoke = userId === 'aos-term' ? `**(Galactic Room)**: ${joke}` : joke;
    channel.send(modifiedJoke);
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
    const modifiedQuote = userId === 'aos-term' ? `**(Galactic Room)**: ${quote}` : quote;
    channel.send(modifiedQuote);
  }
}

discordClient.on('messageCreate', async message => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // Check for !setlang command
  if (message.content.startsWith('!setlang')) {
    const [, lang] = message.content.split(' ');
    if (lang === 'en' || lang === 'tr') {
      userLanguage[userId] = lang;
      saveUserLanguagePreferences(); // Save preferences to file
      message.channel.send(`Language set to ${lang === 'en' ? 'English' : 'Turkish'}`);
      forwardMessageToInterstellarChat(message, lang); // Forward language setting to aos terminal
    } else {
      message.channel.send('Invalid language. Use !setlang en or !setlang tr');
    }
    return;
  }

  // Determine the user's language or default to English
  const lang = userLanguage[userId] || 'en';

  // Automatically respond to !joke command
  if (message.content === '!joke') {
    handleCommand('!joke', message.channel, lang, userId);
  }

  // Automatically respond to !quote command
  if (message.content === '!quote') {
    handleCommand('!quote', message.channel, lang, userId);
  }

  // Respond to !weather command
  if (message.content === '!weather') {
    handleWeatherCommand(message.channel);
  }

  // Respond to !arprice command for Arweave price
  if (message.content.startsWith('!price')) {
    const [, coin] = message.content.split(' ');
    if (coin) {
      const priceMessage = await fetchCryptoPrice(coin.toUpperCase());
      message.channel.send(priceMessage);
    } else 
      message.channel.send('**Please specify a coin (e.g., !price btc).**');
    
  }

  console.log(`💬 Message from ${message.author.username}: ${message.content}`);
  forwardMessageToInterstellarChat(message, lang);
});

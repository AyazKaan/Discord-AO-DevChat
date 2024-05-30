require('dotenv').config(); // Load environment variables
const { Client, GatewayIntentBits } = require('discord.js');
const WebSocket = require('ws');
const { message, createDataItemSigner } = require('@permaweb/aoconnect');
const { readFileSync } = require('fs');
const rateLimit = require('express-rate-limit');
const express = require('express');
const app = express();

// Configuration
const botToken = process.env.DISCORD_BOT_TOKEN;
const discordChannelId = process.env.DISCORD_CHANNEL_ID; // Discord channel ID

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

async function forwardMessageToInterstellarChat(messageData) {
  const user = messageData.author.username;
  const content = messageData.content;

  // If the message is from RelayBot or DevChat, don't forward it again
  if (user === 'RelayBot' || messageData._fromDevChat) {
    return;
  }

  console.log(`✨ Preparing to teleport message from ${user} to InterstellarChat! 🚀`);
  console.log(`📝 Message content: ${content}`);  // Log the message content

  try {
    const signer = await createDataItemSigner(walletData);
    const response = await message({
      process: 'NAFg0T-grGsqyV1neCV9nPwbNU5d5qXx0ZCpoxmClh8',
      tags: [
        { name: 'Action', value: 'BeamToInterstellarChat' },
        { name: 'Content', value: content },
        { name: 'Sender', value: user },
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
      console.log('📡 Incoming transmission:', messageContent);

      // Check if the message contains the command and extract it
      const commandMatch = messageContent.match(/: (!\w+)/);
      const command = commandMatch ? commandMatch[1] : null;

      const channel = discordClient.channels.cache.get(discordChannelId);
      if (channel) {
        if (command === '!joke' || command === '!quote') {
          // Handle the command
          handleCommand(command, channel);
        } else {
          channel.send(messageContent)
            .then(() => {
              console.log('📤 Message sent to Discord');
              // Since the message is from RelayBot, don't forward it again
              forwardMessageToInterstellarChat({ author: { username: 'RelayBot' }, content: messageContent, _fromDevChat: true });
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

function handleCommand(command, channel) {
  if (command === '!joke') {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything! 🌌",
      "How does a penguin build its house? Igloos it together! 🐧",
      "Why don't skeletons fight each other? They don't have the guts! 💀",
      "Why don't astronauts use social media in space? Because they can't handle the atmosphere! 🚀",
      "Why did Cooper bring a ladder to space? To reach new heights! 🌌",
      "Why did the Interstellar crew bring string to space? To tie up loose ends in the fabric of time! 🕰️"
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    channel.send(joke);
  }

  if (command === '!quote') {
    const quotes = [
      "Shoot for the moon. Even if you miss, you'll land among the stars. - Les Brown 🌕",
      "The only limit to our realization of tomorrow is our doubts of today. - Franklin D. Roosevelt 🌟",
      "What lies behind us and what lies before us are tiny matters compared to what lies within us. - Ralph Waldo Emerson 💫",
      "Success is not the key to happiness. Happiness is the key to success. - Albert Schweitzer 🌈",
      "It is never too late to be what you might have been. - George Eliot ⏳"
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    channel.send(quote);
  }
}

discordClient.on('messageCreate', message => {
  if (message.author.bot) return;

  // Automatically respond to !joke command
  if (message.content === '!joke') {
    handleCommand('!joke', message.channel);
  }

  // Automatically respond to !quote command
  if (message.content === '!quote') {
    handleCommand('!quote', message.channel);
  }

  console.log(`💬 Message from ${message.author.username}: ${message.content}`);
  forwardMessageToInterstellarChat(message);
});

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { message, createDataItemSigner } = require('@permaweb/aoconnect');
const { readFileSync } = require('fs');

const sentMessages = new Set();
const MESSAGE_EXPIRATION_TIME = 60000;

// Configuration
const botToken = process.env.DISCORD_BOT_TOKEN;
const discordChannelId = process.env.DISCORD_CHANNEL_ID;
const aosPid = process.env.AOS_PID;

const walletFilePath = '/root/.aos.json';
const walletData = JSON.parse(readFileSync(walletFilePath).toString());

async function transferMessageToInitRoom(incomingMsg) {
  const sender = incomingMsg.author.username;
  const msgContent = incomingMsg.content;

  if (sentMessages.has(msgContent)) {
    return;
  }

  console.log(`Relaying message from ${sender} to Getting-Started: ${msgContent}`);

  await message({
    process: aosPid,
    tags: [
      { name: 'Action', value: 'ToDiscord' },
      { name: 'Data', value: msgContent },
      { name: 'Event', value: sender },
      { name: 'FromAOS', value: 'true' }
    ],
    signer: createDataItemSigner(walletData),
    data: msgContent,
  })
  .then(response => {
    console.log('Message successfully relayed to Getting-Started:', response);

    sentMessages.add(msgContent);
    setTimeout(() => {
      sentMessages.delete(msgContent);
    }, MESSAGE_EXPIRATION_TIME);
  })
  .catch(error => {
    console.error('Error relaying message to Getting-Started:', error);
  });
}

const discordBot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

discordBot.once('ready', () => {
  console.log(`Logged in as ${discordBot.user.tag}!`);
});

discordBot.login(botToken);

discordBot.on('messageCreate', message => {
  if (message.channel.id === discordChannelId && !message.author.bot) {
    console.log(`Message from ${message.author.username}: ${message.content}`);
    transferMessageToInitRoom(message);
  }
});

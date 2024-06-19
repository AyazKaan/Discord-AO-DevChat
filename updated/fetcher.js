const { results } = require('@permaweb/aoconnect');
const WebSocket = require('ws');
const { transmitMessage } = require('./messageDispatcher');
require('dotenv').config();

let latestMarker = '';
const sentMessages = new Set();
const MESSAGE_EXPIRATION_TIME = 60000;
let wsClient;

const aosPid = process.env.AOS_PID;
const gettingStartedPid = process.env.GETTING_STARTED_PID;

function initializeWebSocket() {
  wsClient = new WebSocket('ws://localhost:8080');

  wsClient.on('open', () => {
    console.log('🔗 WebSocket connection established.');
    retrieveMessagesFromInitRoom();
  });

  wsClient.on('error', error => {
    console.error('⚠️ WebSocket encountered an error:', error);
  });

  wsClient.on('close', () => {
    console.log('🔌 WebSocket connection closed. Reconnecting...');
    setTimeout(initializeWebSocket, 10000);
  });

  wsClient.on('message', message => {
    console.log('📩 Received WebSocket message:', message);
  });
}

async function retrieveMessagesFromInitRoom() {
  try {
    if (!latestMarker) {
      const initialFetch = await results({
        process: gettingStartedPid,
        sort: 'DESC',
        limit: 1,
      });
      if (initialFetch.edges.length > 0) {
        latestMarker = initialFetch.edges[0].cursor;
      }
    }

    const recentFetch = await results({
      process: gettingStartedPid,
      from: latestMarker,
      sort: 'ASC',
      limit: 50,
    });

    for (const record of recentFetch.edges.reverse()) {
      latestMarker = record.cursor;
      const entries = record.node?.Messages || [];

      const filteredEntries = entries.filter(entry => entry.Tags.some(tag => tag.name === 'Action' && tag.value === 'Broadcasted'));

      for (const entry of filteredEntries) {
        const content = entry.Data || 'No content';
        const nicknameTag = entry.Tags.find(tag => tag.name === 'Nickname');
        const nickname = nicknameTag ? nicknameTag.value : 'Unknown';

        if (nickname === '<ADD.YOUR.SHORT.NICK.ON.AOS>' || nickname === aosPid) {
          continue;
        }

        if (!sentMessages.has(content)) {
          const event = entry.Tags.find(tag => tag.name === 'Event')?.value || nickname;
          const languageTag = entry.Tags.find(tag => tag.name === 'Language');
          const language = languageTag ? languageTag.value : 'en';
          const formattedMessage = `${event}: **${content}**`;
          const senderId = entry.Tags.find(tag => tag.name === 'Sender')?.value;
          const fromAOS = entry.Tags.find(tag => tag.name === 'FromAOS');

          if (fromAOS && fromAOS.value === 'true') {
            continue;
          }

          if (content.trim().startsWith('!setlang')) {
            const [, chosenLang] = content.trim().split(' ');
            wsClient.send(JSON.stringify({ command: '!setlang', lang: chosenLang, content: content.trim(), userId: senderId }));
          } else {
            wsClient.send(JSON.stringify({ content: formattedMessage, _fromDevChat: true, command: content.trim(), lang: language, userId: senderId }));
            console.log('Sending message to WebSocket:', formattedMessage);
            transmitMessage({ author: { username: senderId }, content: formattedMessage });
          }

          sentMessages.add(content);
          setTimeout(() => {
            sentMessages.delete(content);
          }, MESSAGE_EXPIRATION_TIME);
        }
      }
    }
  } catch (error) {
    console.error('🚨 Error retrieving messages from Getting-Started:', error);
  } finally {
    setTimeout(retrieveMessagesFromInitRoom, 10000);
  }
}

initializeWebSocket();

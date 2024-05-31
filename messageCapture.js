const { results } = require('@permaweb/aoconnect');
const WebSocket = require('ws');

let lastMarker = '';
const wsConnection = new WebSocket('ws://localhost:8080'); // Start WebSocket connection

wsConnection.on('open', () => {
  console.log('🌟 WebSocket connection established. Ready for interstellar communication!');
});

wsConnection.on('error', error => {
  console.error('🚨 WebSocket error:', error);
});

async function fetchMessagesFromInterstellarChat() {
    try {
      if (!lastMarker) {
        const initialResults = await results({
          process: 'NAFg0T-grGsqyV1neCV9nPwbNU5d5qXx0ZCpoxmClh8',
          sort: 'DESC',
          limit: 1,
        });
        if (initialResults.edges.length > 0) {
          lastMarker = initialResults.edges[0].cursor;
        }
        console.log('✨ Initial results fetched:', formatResult(initialResults));
      }
  
      console.log('🧲 Fetching messages from InterstellarChat...');
      const newResults = await results({
        process: 'NAFg0T-grGsqyV1neCV9nPwbNU5d5qXx0ZCpoxmClh8',
        from: lastMarker,
        sort: 'ASC',
        limit: 50,
      });
  
      for (const edge of newResults.edges.reverse()) {
        lastMarker = edge.cursor;
        const messages = edge.node?.Messages || [];
        console.log('📨 Message Data:', formatMessages(messages));
  
        const filteredMsgs = messages.filter(msg => msg.Tags.some(tag => tag.name === 'Action' && tag.value === 'Say'));
        console.log('🔍 Filtered Messages:', formatMessages(filteredMsgs));
  
        for (const msg of filteredMsgs) {
          const event = msg.Tags.find(tag => tag.name === 'Event')?.value || '**(Galactic Room)**';
          const langTag = msg.Tags.find(tag => tag.name === 'Language');
          const lang = langTag ? langTag.value : 'en';
          const msgToSend = `${event}: ${msg.Data}`;
          const userId = msg.Tags.find(tag => tag.name === 'Sender')?.value || 'aos-term';
  
          console.log('📩 Captured Message:', msgToSend);
  
          if (msg.Data.trim().startsWith('!setlang')) {
            const [, selectedLang] = msg.Data.trim().split(' ');
            console.log(`🌐 Sending !setlang command to WebSocket: ${selectedLang}`);
            wsConnection.send(JSON.stringify({ command: '!setlang', lang: selectedLang, content: msg.Data.trim(), userId }));
          } else {
            wsConnection.send(JSON.stringify({ content: msgToSend, _fromDevChat: true, command: msg.Data.trim(), lang, userId }));
          }
        }
      }
    } catch (error) {
      console.error('🌌 Error fetching messages from InterstellarChat:', error);
      console.error('🔍 Error details:', error.message);
    } finally {
      setTimeout(fetchMessagesFromInterstellarChat, 10000);
    }
  }
  

function formatResult(result) {
  return JSON.stringify(result, null, 2); // Pretty print JSON
}

function formatMessages(messages) {
  return messages.map(msg => ({
    Target: msg.Target,
    Data: msg.Data,
    Tags: msg.Tags.map(tag => `${tag.name}: ${tag.value}`).join(', '),
    Anchor: msg.Anchor
  })).map(msg => JSON.stringify(msg, null, 2)).join('\n'); // Pretty print messages
}

fetchMessagesFromInterstellarChat();

const { message, createDataItemSigner } = require('@permaweb/aoconnect');
const { readFileSync } = require('node:fs');
require('dotenv').config();

const aosPid = process.env.AOS_PID;

const walletData = JSON.parse(
  readFileSync('/root/.aos.json').toString(),
);

async function transmitMessage(msg) {
  const senderName = msg.author.username;

  await message({
      process: aosPid,
    tags: [
      { name: 'Action', value: 'ToDiscord' },
      { name: 'Data', value: msg.content },
      { name: 'Event', value: senderName },
      { name: 'FromAOS', value: 'true' }
    ],
    signer: createDataItemSigner(walletData),
    data: msg.content,
  })
  .then(console.log)
  .catch(console.error);
}

module.exports = {
  transmitMessage,
};


<div style="word-wrap: break-word;">
# InterstellarChat Relay Bot


InterstellarChat Relay Bot is a fun and interactive bot designed 
to relay messages between a native chatroom and a Discord server.
It also includes rate limiting and command handling for a better user experience.

## Features

- Relay messages between GalacticRoom and Discord
- Rate limiting to prevent spam
- Fun and interactive commands like `!joke` and `!quote`
- Themed logging and messages for an engaging experience

## Prerequisites

- Node.js and npm: Make sure Node.js and npm are installed.
- Lua: Ensure Lua is installed on your system.
- Required npm Packages:
    Install `discord.js`, `ws`, `@permaweb/aoconnect`, `fs`, `express`, and `express-rate-limit`.

## Installation

1. Install the required npm packages:


  ` npm install discord.js ws @permaweb/aoconnect fs express express-rate-limit`


2. Create a `.env` file in the root directory with your Discord bot token and channel ID:


   DISCORD_BOT_TOKEN=your-discord-bot-token
   DISCORD_CHANNEL_ID=your-discord-channel-id


4. Ensure your wallet file is located at `/root/.aos.json`.

## Project Structure

<pre>/root/InterstellarChatRelayBot/src/
|-- server.js
|-- messageCapture.js
|-- client.lua
|-- chatroom.lua
|-- router.lua
</pre>

## Setup and Usage

### Step 1: Start the Lua Scripts

Load the required Lua scripts in the AOS terminal:



`.load /root/InterstellarChatRelayBot/src/router.lua`

`.load /root/InterstellarChatRelayBot/src/client.lua`

`.load /root/InterstellarChatRelayBot/src/chatroom.lua`


### Step 2: Register and Join the Channel

Register the channel by sending a message to the router:


`ao.send({ Target = "xnkv_QpWqICyt8NpVMbfsUQciZ4wlm5DigLrfXRm8fY", Action = "Register", Name = "GalacticRoom" })`

`Join("GalacticRoom")`


### Step 3: Send a Test Message

Send a test message to the joined channel:


`Say("Hello, can anyone hear me?", "GalacticRoom")`


### Step 4: Start the WebSocket Server

Run the `server.js` script to start the WebSocket server and log in the Discord bot:


`node server.js`


### Step 5: Start Capturing Messages from InterstellarChat

Run the `messageCapture.js` script to start capturing messages from InterstellarChat and sending them via WebSocket:


`node messageCapture.js`


### Step 6: Test the Setup

#### Sending a Message from InterstellarChat

Use the `Say` command in InterstellarChat to send a message to a room:


`Say("Hello, this is a test message.", "GalacticRoom")`


#### Receiving the Message in Discord

Check the specified Discord channel to see if the message appears.

#### Sending a Message from Discord

Send a message in the specified Discord channel and check if it gets relayed to InterstellarChat.

## Commands

- `!joke`: Get a random joke.
- `!quote`: Get a random motivational quote.
</div>
<div style="text-align: center;">
  <pre>
          _____                   _______                   _____
         /\    \                 /::\    \                 /\    \
        /::\    \               /::::\    \               /::\    \
       /::::\    \             /::::::\    \             /::::\    \
      /::::::\    \           /::::::::\    \           /::::::\    \
     /:::/\:::\    \         /:::/~~\:::\    \         /:::/\:::\    \
    /:::/__\:::\    \       /:::/    \:::\    \       /:::/__\:::\    \
   /::::\   \:::\    \     /:::/    / \:::\    \      \:::\   \:::\    \
  /::::::\   \:::\    \   /:::/____/   \:::\____\   ___\:::\   \:::\    \
 /:::/\:::\   \:::\    \ |:::|    |     |:::|    | /\   \:::\   \:::\    \
/:::/  \:::\   \:::\____\|:::|____|     |:::|    |/::\   \:::\   \:::\____\
\::/    \:::\  /:::/    / \:::\    \   /:::/    / \:::\   \:::\   \::/    /
 \/____/ \:::\/:::/    /   \:::\    \ /:::/    /   \:::\   \:::\   \/____/
          \::::::/    /     \:::\    /:::/    /     \:::\   \:::\    \
           \::::/    /       \:::\__/:::/    /       \:::\   \:::\____\
           /:::/    /         \::::::::/    /         \:::\  /:::/    /
          /:::/    /           \::::::/    /           \:::\/:::/    /
         /:::/    /             \::::/    /             \::::::/    /
        /:::/    /               \::/____/               \::::/    /
        \::/    /                 ~~                      \::/    /
         \/____/                                           \/____/
</pre>
</div>
chat PID: NAFg0T-grGsqyV1neCV9nPwbNU5d5qXx0ZCpoxmClh8

main PID: RJo-aiH2TopYr-zLreGuO88b7HN0sauxox7_NbYM1I4

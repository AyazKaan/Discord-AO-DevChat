<div>

## InterstellarChat Relay Bot

InterstellarChat Relay Bot is a fun and interactive bot designed 
to relay messages between a native chatroom and a Discord server.
It also includes rate limiting and command handling for a better user experience.

## Features

- Relay messages between GalacticRoom and Discord
- Rate limiting to prevent spam
- Users can select the language preferences for commands in English and Turkish.
- Fun and interactive commands like `!joke` and `!quote`
- Themed logging and messages for an engaging experience


## Installation

1. Install the required npm packages:


  ` npm install discord.js ws @permaweb/aoconnect fs express express-rate-limit`


2. Create a `.env` file in the root directory with your Discord bot token and channel ID:


  - DISCORD_BOT_TOKEN=your-discord-bot-token
  - DISCORD_CHANNEL_ID=your-discord-channel-id


3. Ensure your wallet file is located at `/root/.aos.json`.

<pre>/root/
|-- server.js
|-- messageCapture.js
|-- userLanguage.json
|-- client.lua
|-- chatroom.lua
|-- router.lua
</pre>

## Setup and Usage

Load the required Lua scripts in the AOS terminal:


`.load /root/router.lua`

`.load /root/client.lua`

`.load /root/chatroom.lua`


### Register and Join the Channel

Register the channel by sending a message to the router:


`ao.send({ Target = "xnkv_QpWqICyt8NpVMbfsUQciZ4wlm5DigLrfXRm8fY", Action = "Register", Name = "GalacticRoom" })`

`Join("GalacticRoom")`


### Send a Test Message

Send a test message to the joined channel:


`Say("Hello, can anyone hear me?", "GalacticRoom")`


### Start the WebSocket Server

Run the `server.js` script to start the WebSocket server and log in the Discord bot:


`node server.js`


### Start Capturing Messages from InterstellarChat

Run the `messageCapture.js` script to start capturing messages from InterstellarChat and sending them via WebSocket:


`node messageCapture.js`


## Commands

- `!joke`: Get a random joke. 
- `!quote`: Get a random motivational quote. 
- `Say("!joke", "GalacticRoom")`
- `Say("!quote", "GalacticRoom")`
- `!setlang [en|tr]`: Set your preferred language for bot responses.
-  Example usage: `!setlang en` / `!setlang tr` or in AOS `Say("!setlang en|tr", "GalacticRoom")`
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

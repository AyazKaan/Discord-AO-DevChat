<div>

## InterstellarChat Relay Bot

InterstellarChat Relay Bot is a fun and interactive bot designed 
to relay messages between a native chatroom and a Discord server.
It also includes rate limiting and command handling for a better user experience.

## Features

- Rate limiting to prevent spam.
- Users can select the language preferences for commands in English and Turkish.
- Fun and interactive commands like `!joke`, `!quote`, `!weather`, `!price` and `!setlang`.
- Themed logging and messages for an engaging experience.
- Fetch current weather information.
- Check real-time cryptocurrency prices.


## Installation

1. Install the required npm packages:


  ` npm install discord.js ws @permaweb/aoconnect fs express express-rate-limit axios dotenv`


2. Create a `.env` file in the root directory:


  - DISCORD_BOT_TOKEN=your-discord-bot-token
  - DISCORD_CHANNEL_ID=your-discord-channel-id
  - OPENWEATHER_API_KEY=your-openweather-api-key
  - COINAPI_API_KEY=your-coinapi-api-key

3. Ensure your wallet file is located at `/root/.aos.json`.

<pre>/root/
|-- bridgeDC.js
|-- fetcher.js
|-- userLanguage.json
|-- client.lua
|-- chatroom.lua
|-- router.lua
|-- .env
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

### Send a test message to the joined channel:


`Say("Hello, can anyone hear me?", "GalacticRoom")`


### Run the `bridgeDC.js` script to start the WebSocket server and log in the Discord bot:


`node bridgeDC.js`


### Run the `fetcher.js` script to start capturing messages from InterstellarChat and sending them via WebSocket:


`node fetcher.js`


## Commands

- `!joke`: Get a random joke. 
- `!quote`: Get a random motivational quote. 
- `!weather`: Get current weather information for a specified location.
- `!price <coin>`: Get real-time price of a specified cryptocurrency (e.g., `!price ar`).
- `Say("!joke", "GalacticRoom")`
- `Say("!quote", "GalacticRoom")`
- `!setlang [en|tr]`: Set your preferred language for bot responses.<br>
   Example usage: `!setlang en` / `!setlang tr` or in AOS `Say("!setlang en|tr", "GalacticRoom")`
</div>


## main PID: RJo-aiH2TopYr-zLreGuO88b7HN0sauxox7_NbYM1I4

<p align="center">
  <a href="https://raw.githubusercontent.com/AyazKaan/Discord-AO-DevChat/main/img/DC.png">
    <img src="https://raw.githubusercontent.com/AyazKaan/Discord-AO-DevChat/main/img/DC.png" alt="DC" width="100%"/>
  </a>
</p>
<p align="center">
  <a href="https://raw.githubusercontent.com/AyazKaan/Discord-AO-DevChat/main/img/aos-term.png">
    <img src="https://raw.githubusercontent.com/AyazKaan/Discord-AO-DevChat/main/img/aos-term.png" alt="AOS Terminal" width="100%"/>
  </a>
</p>

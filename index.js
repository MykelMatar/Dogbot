const { Client, Collection } = require('discord.js');
const data = require("./data.json");
require('dotenv').config();

const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });   // Discord.js 13 requires user to specify all intents that the bot uses

client.commands = new Collection();
client.events = new Collection(); 

['command_handler', 'event_handler'].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});

client.login(process.env.bot_token)

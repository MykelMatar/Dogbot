const { Discord, Client, MessageEmbed, Message, DiscordAPIError, Collection } = require('discord.js');
const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });   // Discord.js 13 requires user to specify all intents that the bot uses
require('dotenv').config();
const config = require('./config.json');
const data = require('./data.json');

client.commands = new Collection(); 
client.events = new Collection(); 

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
});


client.login(process.env.bot_token);
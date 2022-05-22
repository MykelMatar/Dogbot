const { Client, Collection } = require('discord.js');
require('dotenv').config();

const client = new Client({intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_MESSAGE_REACTIONS']});

client.commands = new Collection();
client.events = new Collection();

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.login(process.env.BOT_TOKEN)

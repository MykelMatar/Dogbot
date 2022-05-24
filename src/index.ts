const {Client, Collection} = require('discord.js');
import express from 'express';
import 'dotenv/config'

const client = new Client({intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES']})
client.commands = new Collection(); // create commands property for Client so commands can be passed around 

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`).default(client)
});

client.login(process.env.BOT_TOKEN)

const app = express();
app.listen(4000, () => {
    console.log(`server running on port 4000`);
});
const {Client, Collection} = require('discord.js');
import express from 'express';
import 'dotenv/config'

const client = new Client({
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_PRESENCES'],
    sweepers: {
        messages: {
            lifetime: 60,
            interval: 120
        }
    }
})
client.commands = new Collection(); // create commands property for Client so commands can be passed around 

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`).default(client)
});

client.login(process.env.BOT_TOKEN).catch(console.error)

// express server on port 8080 for docker
const app = express();
app.listen(8080, () => {
    console.log(`server running on port 8080`);
});
//console.log(process.memoryUsage().heapUsed / 1024 / 1024) check mb of mem usage
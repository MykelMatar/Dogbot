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

import RPC from "discord-rpc"
//discord-rpc
const clientId = '848283770041532425'
//const scopes = ['rpc', 'rpc.api', 'messages.read']
const clientRPC = new RPC.Client({transport: 'ipc'})
const startTimestamp = new Date()
RPC.register(clientId)

async function setActivity() {
    if (!clientRPC) return;
    clientRPC.setActivity({
        details: 'exploring the inner workings of my mind',
        state: 'vibing',
        startTimestamp,
        largeImageKey: 'Dogbot_512',
        largeImageText: 'Gaming with Dogbot',
        instance: false,
        buttons: [
            {
                label: 'wiki',
                url: 'https://github.com/MykelMatar/Dogbot/wiki'
            }
        ]
    })
}

clientRPC.on('ready', async () => {
    await setActivity();

    // activity can only be set every 15 seconds
    setInterval(() => {
        setActivity();
    }, 15e3);
})
clientRPC.login({clientId}).catch(console.error)

client.login(process.env.BOT_TOKEN).catch(console.error)

// express server on port 8080 for docker
// const app = express();
// app.listen(8080, () => {
//     console.log(`server running on port 8080`);
// });
// console.log(process.memoryUsage().heapUsed / 1024 / 1024) check mb of mem usage
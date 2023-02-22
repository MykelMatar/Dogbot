import {Client, Collection, GatewayIntentBits} from "discord.js";
import 'dotenv/config'
import {NewClient} from "./dependencies/myTypes";
import log from "./dependencies/logger";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    sweepers: {
        messages: {
            lifetime: 60,
            interval: 120
        }
    },
}) as NewClient

client.commands = new Collection();
client.isTestBot = false; // set false if deploying Dogbot

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`).default(client)
});

if (client.isTestBot) {
    client.login(process.env.BOT_TEST_TOKEN).catch(e => log.error(e))
} else {
    client.login(process.env.BOT_TOKEN).catch(e => log.error(e))
}

//console.log(process.memoryUsage().heapUsed / 1024 / 1024) check mb of mem usage
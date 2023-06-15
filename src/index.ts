import {ActivityType, Client, Collection, GatewayIntentBits} from "discord.js";
import 'dotenv/config'
import {NewClient} from "./dependencies/myTypes";
import log from "./dependencies/constants/logger";

const client: NewClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildEmojisAndStickers
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
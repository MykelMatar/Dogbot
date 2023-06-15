import {ActivityType, Client, Collection, GatewayIntentBits} from "discord.js";
import 'dotenv/config'
import {NewClient} from "./dependencies/myTypes";
import log from "./dependencies/constants/logger";

// TODO: maybe let dogbot scan chat messages for an IP address, and if one is detected ask if they want to add the ip to the mc server list
// this feature can be toggleable via a command

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
client.isTestBot = true; // set false if deploying Dogbot

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`).default(client)
});

if (client.isTestBot) {
    client.login(process.env.BOT_TEST_TOKEN).catch(e => log.error(e))
} else {
    client.login(process.env.BOT_TOKEN).catch(e => log.error(e))
}
import {ActivityType, Client, Collection, GatewayIntentBits} from "discord.js";
import 'dotenv/config'
import {CustomClient} from "./dependencies/myTypes";
import log from "./dependencies/constants/logger";
import AutoPoster from "topgg-autoposter";

const client: CustomClient = new Client({
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
}) as CustomClient

client.commands = new Collection();
client.isTestBot = false;

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`).default(client)
});


if (client.isTestBot) {
    client.login(process.env.BOT_TEST_TOKEN).catch(e => log.error(e))
} else {
    AutoPoster(process.env.TOPGG_TOKEN, client)
    client.login(process.env.BOT_TOKEN).catch(e => log.error(e))
}
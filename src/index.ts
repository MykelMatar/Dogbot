import {Client, Collection, GatewayIntentBits} from "discord.js";
import 'dotenv/config'
import {newClient} from "./dependencies/myTypes";
import {log} from "./dependencies/logger";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.MessageContent],
    sweepers: {
        messages: {
            lifetime: 60,
            interval: 120
        }
    }
}) as newClient

client.commands = new Collection(); // create commands property for Client so commands can be passed around 

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`).default(client)
});

client.login(process.env.BOT_TOKEN).catch(e => log.error(e))

//console.log(process.memoryUsage().heapUsed / 1024 / 1024) check mb of mem usage
import {Client} from "discord.js";
import {getFiles} from "../dependencies/helpers/get-files";

export default (client: Client) => {
    const commandFiles = getFiles('./commands', '.ts')

    for (const commandFile of commandFiles){
        let commands = require(`.${commandFile}`)
        for (let command in commands) {
            //@ts-ignore
            client.commands.set(commands[command].name, commands[command])
        }
    }
}


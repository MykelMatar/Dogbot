import {getFiles} from "../dependencies/helpers/get-files";
import {NewClient} from "../dependencies/myTypes";
import {REST} from "@discordjs/rest";
import {Routes} from "discord.js"


export default (client: NewClient) => {
    const commandFiles = getFiles('./src/commands', '.ts')
    let commands: object[] = []

    for (const commandFile of commandFiles) {
        let commandList = require(`../.${commandFile}`)
        for (let command in commandList) {
            client.commands.set(commandList[command].data.name, commandList[command])
            commands.push(commandList[command].data.toJSON())
        }
    }

    const rest = new REST({version: '10'}).setToken(process.env.BOT_TOKEN);
    (async () => {
        await rest.put(
            Routes.applicationGuildCommands('848283770041532425', '351618107384528897'),
            {body: commands},
        );
    })();
}


import {getFiles} from "../dependencies/helpers/getFiles";
import {NewClient} from "../dependencies/myTypes";
import {REST} from "@discordjs/rest";
import {Routes} from "discord.js"


export default (client: NewClient) => {
    let ignore: string[] = !client.isTestBot ? ['test', 'voice'] : [];
    const commandFiles = getFiles('./src/commands', '.ts', ignore)
    let commands: object[] = []

    for (const commandFile of commandFiles) {
        let commandList = require(`../.${commandFile}`)
        for (let command in commandList) {
            client.commands.set(commandList[command].data.name, commandList[command])
            if (commandList[command].data.name != 'reload') {
                commands.push(commandList[command].data.toJSON())
            }
        }
    }
    

    // slash command registration
    if (client.isTestBot) { // Guild bound commands using testing bot
        let testingServer = '715122900021149776'
        let testBotId = '851186508262408192'

        const rest = new REST({version: '10'}).setToken(process.env.BOT_TEST_TOKEN);
        (async () => {
            await rest.put(
                Routes.applicationGuildCommands(testBotId, testingServer),
                {body: commands},
            );
        })();
    } else { // global slash command on Dogbot
        let dogbotId = '848283770041532425'
        let myServer = '351618107384528897'

        const rest = new REST({version: '10'}).setToken(process.env.BOT_TOKEN);
        (async () => {
            await rest.put(
                Routes.applicationCommands(dogbotId),
                {body: commands},
            );
            await rest.put(
                Routes.applicationGuildCommands(dogbotId, myServer),
                {body: [client.commands.get('reload').data.toJSON()]},
            );
        })();
    }
}


import {getFiles} from "../dependencies/helpers/otherHelpers/getFiles";
import {CustomClient} from "../dependencies/myTypes";
import {REST} from "@discordjs/rest";
import {Routes} from "discord.js"


export default (client: CustomClient) => {
    const ignore: string[] = !client.isTestBot ? ['test'] : [];
    const adminCommandNames = ['git-pull', 'reload']

    const commandFiles = getFiles('./src/commands', '.ts', ignore)
    const commands = []

    for (const commandFile of commandFiles) {
        const commandList = require(`../.${commandFile}`)
        for (let command in commandList) {
            const commandData = commandList[command].data;
            client.commands.set(commandData.name, commandList[command]);
            commands.push(commandData.toJSON());
        }
    }

    // command registration
    (async () => {
        if (client.isTestBot) {
            const testingServer = '715122900021149776'
            const testBotId = '851186508262408192'

            const rest = new REST({version: '10'}).setToken(process.env.BOT_TEST_TOKEN);
            await rest.put(
                Routes.applicationGuildCommands(testBotId, testingServer),
                {body: commands},
            );
        } else {
            const dogbotId = '848283770041532425'
            const myServer = '351618107384528897'

            const officialCommands = commands.filter(command => !adminCommandNames.includes(command.name));
            const adminCommands = adminCommandNames.map(command => client.commands.get(command).data.toJSON());

            const rest = new REST({version: '10'}).setToken(process.env.BOT_TOKEN);
            await rest.put(
                Routes.applicationCommands(dogbotId),
                {body: officialCommands},
            );
            await rest.put(
                Routes.applicationGuildCommands(dogbotId, myServer),
                {body: adminCommands},
            );
        }
    })();
}


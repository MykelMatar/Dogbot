import {CommandInteraction, Routes, SlashCommandBuilder} from "discord.js";
import {NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/constants/logger";
import {getFiles} from "../../dependencies/helpers/getFiles";
import {REST} from "@discordjs/rest";
import {test} from "../test/test";


export const reload = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('reload all commands'),

    async execute(client: NewClient, interaction: CommandInteraction) {
        if (interaction.user.id != '191754197203550208') return
        log.info('refreshing all commands...')
        await interaction.deferReply({ephemeral: true})

        let ignore: string[] = !client.isTestBot ? ['test', 'voice'] : [];
        const commandFiles = getFiles('./src/commands', '.ts', ignore)

        const newCommands = [];

        for (const commandFile of commandFiles) {
            delete require.cache[require.resolve(`../../.${commandFile}`)];
            let commandList = require(`../../.${commandFile}`)
            for (let command in commandList) {
                const commandData = commandList[command].data;
                client.commands.delete(commandData.name); // must delete to remove cached commands
                client.commands.set(commandData.name, commandList[command])
                newCommands.push(commandData);
            }
        }

        const testingServer = '715122900021149776'
        const testBotId = '851186508262408192'
        const dogbotId = '848283770041532425'

        try {
            if (client.isTestBot) {
                const rest = new REST({version: '10'}).setToken(process.env.BOT_TEST_TOKEN);
                await rest.put(
                    Routes.applicationGuildCommands(testBotId, testingServer),
                    {body: newCommands},
                );
            } else {
                const rest = new REST({version: '10'}).setToken(process.env.BOT_TOKEN);
                await rest.put( // clear commands before pushing again
                    Routes.applicationCommands(dogbotId),
                    {body: []},
                );
                await rest.put(
                    Routes.applicationCommands(dogbotId),
                    {body: newCommands},
                );
            }
            await interaction.editReply({content: 'Commands Refreshed'})
            log.info('done')
        } catch (e) {
            await interaction.editReply({content: 'Error refreshing commands'})
            log.error(e)
        }
    }
}
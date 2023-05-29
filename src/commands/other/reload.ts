import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {getFiles} from "../../dependencies/helpers/getFiles";

export const reload = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('reload all commands'),

    async execute(client: NewClient, interaction: CommandInteraction) {
        if (interaction.user.id != '191754197203550208') return
        log.info('refreshing all commands...')

        let ignore: string[] = !client.isTestBot ? ['test', 'voice'] : [];
        const commandFiles = getFiles('./src/commands', '.ts', ignore)

        for (const commandFile of commandFiles) {
            delete require.cache[require.resolve(`../../.${commandFile}`)];
            let commandList = require(`../../.${commandFile}`)
            for (let command in commandList) {
                client.commands.delete(commandList[command].data.name);
                client.commands.set(commandList[command].data.name, commandList[command])
            }
        }
        log.info('done')
    }
}
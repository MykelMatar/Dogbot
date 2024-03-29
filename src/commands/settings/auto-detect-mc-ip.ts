import {CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder} from "discord.js";
import {CustomClient, MongoGuild, SlashCommand} from "../../dependencies/myTypes";

export const autoDetectMcIp: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('auto-detect-mc-ip')
        .setDescription('toggles whether dogbot scans chat messages for server IPs or not')
        .addBooleanOption(option =>
            option.setName('set')
                .setDescription('set True to scan and False to stop')
                .setRequired(true)),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {
        const commandOptions = interaction.options as CommandInteractionOptionResolver
        const set = commandOptions.getBoolean('set')

        guildData.settings.autoDetectIP = set
        await guildData.save()

        await interaction.reply({content: `IP auto-detect set to ${set}`, ephemeral: true})
    }
}
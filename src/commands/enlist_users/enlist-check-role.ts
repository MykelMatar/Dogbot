import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {NewClient} from "../../dependencies/myTypes";

export const enlistCheckRole = {
    data: new SlashCommandBuilder()
        .setName('enlist-check-role')
        .setDescription('Returns the role currently being used to auto enlist')
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display the response or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData): Promise<void> {
        let enlistRole = guildData.ServerData.roles.autoenlist
        let role = interaction.guild.roles.cache.find(r => r.id === enlistRole)
        let ephemeralSetting: boolean
        let hideOption = interaction.options.data
        if (hideOption.length == 0) {
            ephemeralSetting = true
        } else {
            ephemeralSetting = interaction.options.data[0].value as boolean
        }
        if (role !== undefined) {
            await interaction.reply({content: `${role}`, ephemeral: ephemeralSetting})
        } else {
            await interaction.reply({content: `No role selected`, ephemeral: ephemeralSetting})
        }
    }
}
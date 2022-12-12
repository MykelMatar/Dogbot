import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {NewClient} from "../../dependencies/myTypes";
import guilds from "../../dependencies/schemas/guild-schema";

export const enlistCheckRole = {
    data: new SlashCommandBuilder()
        .setName('enlist-check-role')
        .setDescription('Returns the role currently being used to auto enlist')
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display the response or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction): Promise<void> {
        const currentGuild = await guilds.findOne({guildId: interaction.guildId})
        if (!currentGuild) return
        let selectedRole = currentGuild.ServerData.roles.autoenlist

        let role = interaction.guild.roles.cache.find(r => r.id === selectedRole)

        let ephemeralSetting
        let hideOption = interaction.options.data
        if (hideOption.length == 0) ephemeralSetting = true
        else ephemeralSetting = interaction.options.data[0].value

        await interaction.reply({content: `${role}`, ephemeral: ephemeralSetting})
    }
}
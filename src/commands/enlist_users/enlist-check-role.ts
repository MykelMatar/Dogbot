import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {IGuild, NewClient} from "../../dependencies/myTypes";

export const enlistCheckRole = {
    data: new SlashCommandBuilder()
        .setName('enlist-check-role')
        .setDescription('Returns the role currently being used to auto enlist')
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display the response or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild): Promise<void> {
        let enlistRole = guildData.serverData.roles.autoenlist
        let role = interaction.guild.roles.cache.find(r => r.id === enlistRole)
        const options = interaction.options.data;
        const ephemeralSetting = options.length === 0 ? true : options[0].value as boolean;

        await interaction.reply({
            content: role !== undefined ? `${role}` : `No role selected`,
            ephemeral: ephemeralSetting
        });

    }
}
import {CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder} from "discord.js";
import {CustomClient, R6Profile, SlashCommand, UserInfo} from "../../dependencies/myTypes";
import {updateUserData} from "../../dependencies/helpers/otherHelpers/updateUserData";

export const r6Profile: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('r6-profile')
        .setDescription('sets username and platform for Rainbow 6 Siege')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('username')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('select an option')
                .setRequired(true)
                .addChoices(
                    {name: 'PC', value: 'pc'},
                    {name: 'XBOX', value: 'xbox'},
                    {name: 'PSN', value: 'psn'},
                )),

    async execute(client: CustomClient, interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver
        const username = options.getString('username')
        const platform = options.getString('platform')
        const profile: R6Profile = {
            username: username,
            platform: platform
        }

        await updateUserData(interaction, [interaction.user.id], UserInfo.R6Profile, profile)
        await interaction.reply({
            content: `profile saved. You can now use r6-stats without inputting your information.`,
            ephemeral: true
        })
    }
}
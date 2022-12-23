import {CommandInteraction, CommandInteractionOption, SlashCommandBuilder} from "discord.js";
import {GameProfile, NewClient, UserStats} from "../../dependencies/myTypes";
import {updateUserData} from "../../dependencies/helpers/updateUserData";

export const setProfileValorant = {
    data: new SlashCommandBuilder()
        .setName('set-profile-valorant')
        .setDescription('sets username and platform for valorant')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('username excluding the tag (#numbers after name)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('tag (#numbers after name)')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to hide response or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction) {
        let tagOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'tag')
        let usernameOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'username')
        let profile: GameProfile = {
            username: usernameOption.value as string,
            tag: tagOption.value as string
        }
        await updateUserData(interaction, [interaction.user.id], UserStats.valProfile, profile)
        await interaction.reply({
            content: `profile saved. You can now use get-stats-valorant without inputting your information.`,
            ephemeral: true
        })
    }
}
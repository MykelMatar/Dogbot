import {CommandInteraction, CommandInteractionOption, SlashCommandBuilder} from "discord.js";
import {GuildSchema, NewClient} from "../../dependencies/myTypes";
import {StatName, updateUserData} from "../../dependencies/helpers/updateUserData";

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

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema) {
        let userData: object[] = guildData.UserData
        if (userData.length === 0) {
            await interaction.reply({content: 'This server does not have any user data. User data is created upon interacting with the enlist prompt or playing a game'})
        }

        let tagOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'tag')
        let usernameOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'username')
        let username = usernameOption.value as string
        let tag = tagOption.value as string

        await updateUserData(interaction, [interaction.user.id], StatName.valProfile, [username, tag])

        await interaction.reply({
            content: `profile saved. You can now use get-stats-valorant without inputting your information.`,
            ephemeral: true
        })
    }
}
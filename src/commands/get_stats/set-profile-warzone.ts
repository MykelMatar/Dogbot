import {CommandInteraction, CommandInteractionOption, SlashCommandBuilder} from "discord.js";
import {Guild, newClient} from "../../dependencies/myTypes";
import {platforms} from "call-of-duty-api";
import {StatName, updateUserData} from "../../dependencies/helpers/updateUserData";

export const setProfileWarzone = {
    data: new SlashCommandBuilder()
        .setName('set-profile-warzone')
        .setDescription('sets username and platform for warzone')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('username including the tag (#numbers after name)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('select an option')
                .setRequired(true)
                .addChoices(
                    {name: 'All', value: platforms.All },
                    {name: 'PSN', value: platforms.PSN },
                    {name: 'XBOX', value: platforms.XBOX },
                    {name: 'Activision', value: platforms.Activision },
                    {name: 'Battle.net', value: platforms.Battlenet },
                ))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to hide response or not')
                .setRequired(false)),
        
    async execute(client: newClient, interaction: CommandInteraction, guildData: Guild){
        let userData: Array<object> = guildData.UserData
        if (userData.length === 0) {
            await interaction.reply({content: 'This server does not have any user data. User data is created upon interacting with the enlist prompt or playing a game'})
        }

        let platformOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'platform')
        let usernameOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'username')
        let username = usernameOption.value as string
        let platform = platformOption.value as platforms
        
        await updateUserData(interaction, [interaction.user.id], StatName.wzProfile, [username, platform])
        
        await interaction.reply({content: `*profile saved. You can now use get-stats-warzone without inputting your information.*`, ephemeral: true})
    }
}
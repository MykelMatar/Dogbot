import {CommandInteraction, CommandInteractionOption, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {embedColor, IGuild, NewClient} from "../../dependencies/myTypes";
import {login, platforms, Warzone} from "call-of-duty-api";
import log from "../../dependencies/logger";

export const getStatsWarzone = {
    data: new SlashCommandBuilder()
        .setName('get-stats-warzone')
        .setDescription('retrieves and displays warzone stats')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('username including the tag (#numbers after name)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('select an option')
                .setRequired(false)
                .addChoices(
                    {name: 'All', value: platforms.All},
                    {name: 'PSN', value: platforms.PSN},
                    {name: 'XBOX', value: platforms.XBOX},
                    {name: 'Activision', value: platforms.Activision},
                    {name: 'Battle.net', value: platforms.Battlenet},
                ))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('hides stats from others')),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        let platformOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'platform')
        let usernameOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'username')
        let userData, platform: platforms, username: string

        if (platformOption != undefined && usernameOption != undefined) { // if the options are used
            platform = platformOption.value as platforms
            username = usernameOption.value as string
        } else if (platformOption == undefined && usernameOption == undefined) { // if the options are not used
            userData = guildData.userData.find(user => user.id === interaction.user.id)
            if (userData === undefined) {
                return interaction.editReply({content: 'User does not have any data. Please use the input options for the command'})
            }
            if (userData.warzoneProfile == '{}') {
                return interaction.editReply({content: 'Unknown user. Use set-profile-warzone to set your profile or use the command parameters to find a player'})
            }
            platform = userData.warzoneProfile.platform
            username = userData.warzoneProfile.username
        } else if ((platformOption != undefined && usernameOption == undefined) || // if one option is used without the other
            (platformOption == undefined && usernameOption != undefined)) {
            return interaction.editReply({content: `must input both a username and platform. `})
        }

        login(process.env.SSO_TOKEN)
        try {
            let data = await Warzone.fullData(username, platform);
            log.info(data)

            // create Embed w/ user info and stats
            const embed = new EmbedBuilder()
                .setTitle(`${username}'s Warzone Stats`)
                .addFields(
                    {name: 'K/D ', value: ``, inline: true},
                    {name: 'Wins ', value: ``, inline: true},
                    {name: 'Top 10', value: ``, inline: true},
                )
                .setColor(embedColor)
                .setFooter({text: 'via Tracker.gg, visit the website for more info'})

            await interaction.editReply({embeds: [embed]})
        } catch (e) {
            log.error(e)
        }
    }
}
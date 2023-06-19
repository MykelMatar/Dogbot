import {CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {CustomClient, embedColor, MongoGuild, SlashCommand} from "../../dependencies/myTypes";

const R6 = require('r6s-stats-api')

export const r6Stats: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('r6-stats')
        .setDescription('Retrieves Rainbow 6 Siege Ranked Stats')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('username')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('select an option')
                .setRequired(false)
                .addChoices(
                    {name: 'PC', value: 'pc'},
                    {name: 'XBOX', value: 'xbox'},
                    {name: 'PSN', value: 'psn'},
                ))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('hides stats from others')),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {
        const options = interaction.options as CommandInteractionOptionResolver
        const hide = options.getBoolean('hide') ?? false
        let platform = options.getString('platform')
        let username = options.getString('username')
        let userData

        if (!platform && !username) { // if the options are not used
            userData = guildData.userData.find(user => user.id === interaction.user.id)
            if (!userData || JSON.stringify(userData.r6Profile) === '{}') {
                await interaction.reply({
                    content: 'Unknown user. Use r6-profile to set your profile or use the command parameters to find a player',
                    ephemeral: hide
                });
                return
            }
            platform = userData.r6Profile.platform
            username = userData.r6Profile.username
        } else if ((platform && !username) || (!platform && username)) {
            await interaction.reply({
                content: `must input both a username and platform if you are using the options.`,
                ephemeral: hide
            });
            return
        }

        try {
            const rankedStats = await R6.rank(platform, username)
            const generalStats = await R6.general(platform, username)
            const spacer = ' \u200B \u200B \u200B '

            const embed = new EmbedBuilder()
                .setTitle(`${rankedStats.name}'s R6 Ranked Stats`)
                .setDescription(`**${rankedStats.rank}**`)
                .addFields(
                    {name: `K/D ${spacer}${spacer}`, value: rankedStats.kd, inline: true},
                    {name: `HS %${spacer}`, value: generalStats.headshot_, inline: true},
                    {name: `Win %${spacer}`, value: rankedStats.win_, inline: true},
                    {name: `KPM`, value: rankedStats.kills_match, inline: true},
                    {name: `Kills ${spacer}${spacer}`, value: rankedStats.kills, inline: true},
                    {name: `Deaths ${spacer}`, value: rankedStats.deaths, inline: true},
                    // {name: `Matches`, value: rankedStats.matches, inline: true},
                    // {name: `Hours`, value: generalStats.time_played, inline: true},
                )
                .setThumbnail(rankedStats.rank_img)
                .setColor(embedColor)

            await interaction.reply({embeds: [embed], ephemeral: hide})
        } catch (e) {
            console.error(e)
            await interaction.reply({content: 'There was an issue getting stats. Please try again.', ephemeral: true})
        }
    }
}
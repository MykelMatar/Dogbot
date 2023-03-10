import {CommandInteraction, CommandInteractionOption, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {fetchHTML} from "../../dependencies/helpers/fetchHTML";
import {CheerioAPI} from "cheerio";
import {embedColor, IGuild, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {getText} from "../../dependencies/helpers/getText";

export const getStatsValorant = {
    data: new SlashCommandBuilder()
        .setName('get-stats-valorant')
        .setDescription('Retrieves player stats from Tracker.gg')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('username of player, case-sensitive')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('tag of player, case-sensitive')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to hide response or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        let userOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'username')
        let tagOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'tag')
        let userData, user: string, tag: string

        if (tagOption && userOption) { // both options are present
            tag = tagOption.value as string
            user = userOption.value as string
        } else if (!tagOption && !userOption) { // no option is present
            userData = guildData.userData.find(user => user.id === interaction.user.id)
            if (!userData) {
                return interaction.editReply({content: 'User does not have any data. Please use the input options for the command'})
            }
            if (userData.valorantProfile == '{}') {
                return interaction.editReply({content: 'Unknown user. Use set-profile-valorant to set your profile or use the command parameters to find a player'})
            }
            tag = userData.valorantProfile.tag
            user = userData.valorantProfile.username
        } else { // one option is present
            return interaction.editReply({content: `must input both a username and platform. `})
        }
        let uriUser = encodeURIComponent(user.trim())
        let uriTag = encodeURIComponent(tag.trim())

        try {
            const url = `https://tracker.gg/valorant/profile/riot/${uriUser}%23${uriTag}/overview`
            const $: CheerioAPI = await fetchHTML(url);

            let status = getText($, 'h1', true) as string
            let errorInfo = getText($, 'span.lead', true) as string
            if (errorInfo == 'This profile is private.') {
                return interaction.editReply('tracker.gg profile private, cannot access information')
            }
            if (status == '404') {
                log.error(`${status} error. ${errorInfo}`)
                return interaction.editReply(`${status} error. ${errorInfo}`)
            } else if (status == '400') {
                log.error(`${status} error. ${errorInfo}`)
                return interaction.editReply(`${status} error. ${errorInfo}`)
            } else if (status != undefined) {
                return interaction.editReply(`unknown error response. Please open an issue in the github issues page, or check if one already exists.`)
            }

            let statHeaderClass = $('span.stat__value') // stats found in the large header
            let rank: string = statHeaderClass.first().text();
            let stats = getText($, 'span.value') as string[]
            let statPercentages = getText($, 'span.rank') as string[]
            let topAgents = getText($, 'div.value') as string[]
            let topGuns = getText($, 'div.weapon__name') as string[]
            let playtimes = getText($, 'span.playtime') as string[]

            let StatMap = {
                kd: stats[4],
                kdPercent: statPercentages[1],
                headshots: stats[5],
                headshotsPercent: statPercentages[2],
                wins: stats[6],
                kad: stats[14],
                adr: stats[3],
                adrPercentage: statPercentages[0],
                scorePerRound: stats[13],
                killsPerRound: stats[15],
                firstBloods: stats[16],
            }
            let topAgent: string = topAgents[10]
            let topGun = topGuns[0].split(' ')[0]
            let playtime = playtimes[0].split(' ')[1]

            const embed = new EmbedBuilder()
                .setTitle(`${user}'s Valorant Stats`)
                .addFields(
                    {name: 'Rank ', value: rank, inline: true},
                    {name: 'K/D ', value: `${StatMap.kd}⠀_(${StatMap.kdPercent})_`, inline: true},
                    {name: 'Headshot %', value: `${StatMap.headshots}⠀_(${StatMap.headshotsPercent})_`, inline: true},
                    {name: 'Win %', value: StatMap.wins, inline: true},
                    {name: 'KA/D', value: StatMap.kad, inline: true},
                    {name: 'ADR', value: `${StatMap.adr}⠀_(${StatMap.adrPercentage})_`, inline: true},
                    {name: 'Score/Round⠀⠀⠀⠀⠀', value: StatMap.scorePerRound, inline: true}, // + "⠀" = braille blank space, the only white space discord doesn't delete
                    {name: 'Kills/Rounds⠀⠀⠀⠀⠀', value: StatMap.killsPerRound, inline: true},
                    {name: 'First Bloods', value: StatMap.firstBloods, inline: true},
                    {name: 'Top Agent', value: topAgent, inline: true},
                    {name: 'Top Weapon', value: topGun, inline: true},
                    {name: 'Season Playtime ', value: playtime, inline: true},
                )
                .setURL(url)
                .setColor(embedColor)
                .setFooter({text: 'via Tracker.gg, visit the website for more info'})

            await interaction.editReply({embeds: [embed]})
        } catch (error) {
            log.error(error)
        }
    }
}


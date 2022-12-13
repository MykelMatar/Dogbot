import {CommandInteraction, CommandInteractionOption, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {fetchHTML} from "../../dependencies/helpers/fetchHTML";
import {CheerioAPI} from "cheerio";
import {embedColor, GuildSchema, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {getText} from "../../dependencies/helpers/getText";

// TODO make resistant to tracker.gg website changes
// TODO add buttons to get map stats and weapon stats and stuff
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

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema) {
        let userOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'username')
        let tagOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'tag')
        let userData, user: string, tag: string

        if (tagOption != undefined && userOption != undefined) { // if the options are used
            tag = tagOption.value as string
            user = userOption.value as string
        } else if (tagOption == undefined && userOption == undefined) { // if the options are not used
            userData = guildData.UserData.find(user => user.id === interaction.user.id)
            if (userData === undefined) {
                return interaction.editReply({content: 'User does not have any data. Please use the input options for the command'})
            }
            if (userData.valorantProfile == '{}') {
                return interaction.editReply({content: 'Unknown user. Use set-profile-warzone to set your profile or use the command parameters to find a player'})
            }
            tag = userData.valorantProfile.tag
            user = userData.valorantProfile.username
        } else if ((tagOption != undefined && userOption == undefined) || // if one option is used without the other
            (tagOption == undefined && userOption != undefined)) {
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
                return interaction.editReply(`unknown error response. Please open an issue in the github issues page, or check if one already exists. The github page can be accessed by using /elp`)
            }

            let statHeaderClass = $('span.stat__value') // stats found in the large header
            let rank: string = statHeaderClass.first().text();
            let stats = getText($, 'span.value') as string[]
            let statPercentages = getText($, 'span.rank') as string[]
            let topAgents = getText($, 'div.st') as string[]
            let topGuns = getText($, 'div.weapon') as string[]
            let playtimes = getText($, 'span.playtime') as string[]

            let StatMap = {
                kd: stats[4],
                kdPercent: statPercentages[1],
                headshots: stats[5],
                headshotsPercent: statPercentages[2],
                wins: stats[6],
                kad: stats[12],
                adr: stats[3],
                adrPercentage: statPercentages[0],
                scorePerRound: stats[12],
                killsPerRound: stats[13],
                firstBloods: stats[15],
            }
            let topAgent: string = topAgents[0].split(' ')[22]
            let topGun = topGuns[0].split(' ')[1]
            let playtime = `${playtimes[0].split(' ')[10]} ${playtimes[0].split(' ')[11]}`

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


import {CommandInteraction, CommandInteractionOption, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {fetchHTML} from "../../dependencies/helpers/fetchHTML";
import {CheerioAPI} from "cheerio";
import {embedColor, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";

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

    async execute(client: NewClient, interaction: CommandInteraction, guildData) {
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

        // GET web page for user
        try {
            const url = `https://tracker.gg/valorant/profile/riot/${uriUser}%23${uriTag}/overview`
            const $: CheerioAPI = await fetchHTML(url);

            let status, privateProfile, error
            $('h1').each(function() { // h1 is defined if an error code is present
                status = $(this).text()
            });
            $('span.lead').each(function() { // span.lead returns private profile errors
                privateProfile = $(this).text()
                error = $(this).text() // contains error info if profile is not private
            });

            // handle errors
            if (privateProfile == 'This profile is private.') {
                return interaction.editReply('*tracker.gg profile private, cannot access information*')
            }
            if (status == 404) {
                log.error(`${status} error. ${error}`)
                return interaction.editReply(`*${status} error. ${error}*`)
            } else if (status == 400) {
                log.error(`${status} error. ${error}`)
                return interaction.editReply(`*${status} error. ${error}*`)
            } else if (status != undefined) {
                return interaction.editReply(`*unknown error response. Please open an issue in the github issues page, or check if one already exists. The github page can be accessed by using /elp*`)
            }

            // if no errors, proceed
            let stats: string[] = [],
                statsRank: string[] = [],
                topAgents = [],
                playtime_span = [],
                topGuns = []

            let statHeaderClass = $('span.stat__value') // stats found in the large header
            let rank: string = statHeaderClass.first().text();

            // retrieve all values needed for embed
            $('span.value').each(function(i) { // overview stats section
                stats[i] = $(this).text();
            });
            $('span.rank').each(function(i) { // top% for the stats
                statsRank[i] = $(this).text();
            });
            $('div.st').each(function(i) { // top% for the stats
                topAgents[i] = $(this).text();
            });
            $('div.weapon').each(function(i) { // top% for the stats
                topGuns[i] = $(this).text();
            });
            $('span.playtime').each(function(i) { // top% for the stats
                playtime_span[i] = $(this).text();
            });

            let topAgent: string = topAgents[0].split(' ')[22]
            let playtime = `${playtime_span[0].split(' ')[10]} ${playtime_span[0].split(' ')[11]}`

            // create Embed w/ user info and stats
            const embed = new EmbedBuilder()
                .setTitle(`${user}'s Valorant Stats`)
                .addFields(
                    {name: 'Rank ', value: rank, inline: true},
                    {name: 'K/D ', value: `${stats[4]}⠀_(${statsRank[1]})_`, inline: true},
                    {name: 'Headshot %', value: `${stats[5]}⠀_(${statsRank[2]})_`, inline: true},
                    {name: 'Win %', value: stats[6], inline: true},
                    {name: 'KA/D', value: stats[12], inline: true},
                    {name: 'ADR', value: `${stats[3]}⠀_(${statsRank[0]})_`, inline: true},
                    {name: 'Score/Round⠀⠀⠀⠀⠀', value: stats[12], inline: true}, // + "⠀" = braille blank space, the only white space discord doesn't delete
                    {name: 'Kills/Rounds⠀⠀⠀⠀⠀', value: stats[13], inline: true},
                    {name: 'First Bloods', value: stats[15], inline: true},
                    {name: 'Top Agent', value: topAgent, inline: true},
                    {name: 'Top Weapon', value: topGuns[0].split(' ')[1], inline: true},
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


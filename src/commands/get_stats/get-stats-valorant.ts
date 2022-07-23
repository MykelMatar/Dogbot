import {CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {fetchHTML} from "../../dependencies/helpers/fetchHTML";
import {CheerioAPI} from "cheerio";
import {newClient} from "../../dependencies/myTypes";
import {log} from "../../dependencies/logger";


export const getStatsValorant = {
    data: new SlashCommandBuilder()
        .setName('get-stats-valorant')
        .setDescription('Retrieves player stats from Tracker.gg')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('username of player, case-sensitive')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('tag of player, case-sensitive')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to hide response or not')
                .setRequired(false)),

    async execute(client: newClient, interaction: CommandInteraction) {
        // retrieve username and tag
        let user: string = interaction.options.data[0].value.toString()
        let tag: string = interaction.options.data[1].value.toString()
        let uriUser = encodeURIComponent(user.trim()) // encode string to have URI value for URL
        let uriTag = encodeURIComponent(tag.trim())

        // GET web page for user
        try {
            // get webpages
            const $: CheerioAPI = await fetchHTML(`https://tracker.gg/valorant/profile/riot/${uriUser}%23${uriTag}/overview`);

            // catch errors before scraping information
            let status, privateProfile, error
            $('h1').each(function () { // h1 is defined if an error code is present
                status = $(this).text()
            });
            $('span.lead').each(function () { // span.lead returns private profile errors
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
            
            // if no errors, proceed. create arrays to hold stats
            let stats: string[] = [],
                statsRank: string[] = []

            let statHeaderClass = $('span.stat__value') // stats found in the large header
            let rank: string = statHeaderClass.first().text();
            let kad: string = statHeaderClass.last().text();

            $('span.value').each(function (i) { // overview stats section
                stats[i] = $(this).text();
            });
            $('span.rank').each(function (i) { // top% for the stats
                statsRank[i] = $(this).text();
            });

            // create Embed w/ user info and stats
            const embed = new EmbedBuilder()
                .setTitle(`${user}'s Valorant Stats`)
                .addFields(
                    {name: 'Rank ', value: rank, inline: true},
                    {name: 'K/D ', value: `${stats[4]}⠀_(${statsRank[1]})_`, inline: true},
                    {name: 'Headshot %', value: `${stats[5]}⠀_(${statsRank[2]})_`, inline: true},
                    {name: 'Win %', value: stats[6], inline: true},
                    {name: 'KA/D', value: kad, inline: true},
                    {name: 'ADR', value: `${stats[3]}⠀_(${statsRank[0]})_`, inline: true},
                    {name: 'Score/Round⠀⠀⠀⠀⠀', value: stats[12], inline: true}, // + "⠀" = braille blank space, the only white space discord doesn't delete
                    {name: 'Kills/Rounds⠀⠀⠀⠀⠀', value: stats[13], inline: true},
                    {name: 'First Bloods', value: stats[14], inline: true},
                    {name: 'Aces', value: stats[15], inline: true},
                    {name: 'Clutches', value: stats[16], inline: true},
                    {name: 'Most Kills (Match)', value: stats[17], inline: true},
                )
                .setColor("#8570C1")
                .setFooter({text: 'via Tracker.gg, visit the website for more info'})

            await interaction.editReply({embeds: [embed]})
        } catch (error) {
            log.error(error)
        }
    }
}


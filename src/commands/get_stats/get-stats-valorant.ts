import {Client, CommandInteraction, MessageEmbed} from "discord.js";
import {fetchHTML} from "../../dependencies/helpers/fetchHTML";
import {Command} from "../../dependencies/classes/Command";
import {CheerioAPI} from "cheerio";

export const getStatsValorant = new Command(
    'get-stats-valorant',
    'retrieves valorant stats from tracker.gg',
    async (client: Client, interaction: CommandInteraction) => {
        // retrieve username and tag
        let user: string = interaction.options.data[0].value.toString()
        let tag: string = interaction.options.data[1].value.toString()
        let uriUser = encodeURIComponent(user.trim()) // encode string to have URI value for URL
        let uriTag = encodeURIComponent(tag.trim())

        // GET web page for user
        try {
            // get webpages
            const $: CheerioAPI = await fetchHTML(`https://tracker.gg/valorant/profile/riot/${uriUser}%23${uriTag}/overview`);
            // create arrays to hold stats
            let stats: string[] = [],
                topMaps: string[] = [],
                statsRank: string[] = [],
                topAgents: string[] = [],
                topWeapons: string[] = [];

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
            const embed = new MessageEmbed()
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
                    // {name: 'Top Agents', value: `${topAgents[0]}\n${topAgents[1]}\n${topAgents[2]}`, inline: true},
                    // {name: 'Top Weapons', value: `${topWeapons[0]}\n${topWeapons[1]}\n${topWeapons[2]}`, inline: true},
                    // {name: 'Top Maps', value: `${topMaps[0]}\n ${topMaps[14]}\n ${topMaps[28]}\n`, inline: true},
                )
                .setColor("#8570C1")
                .setFooter({text: 'via Tracker.gg, visit the website for more info'})

            await interaction.editReply({embeds: [embed]})
        } catch (error) {
            if (error.response) {
                let status = error.response.status
                let statusText = error.response.statusText
                console.log({status, statusText})

                if (status == 404) { // error handling
                    await interaction.editReply('*invalid username*')
                } else if (status == 451) {
                    await interaction.editReply('*tracker.gg profile private, cannot access information*')
                } else if (status == 400) {
                    await interaction.editReply('*tracker.gg API issues, cannot connect to website. Please try again later*')
                } else if (status == 403) {
                    await interaction.editReply('*blocked connection. Try again later*')
                } else {
                    await interaction.editReply('*unknown error response. Please open an issue in the github issues page, or check if one already exists. The github page can be accessed by using /elp*')
                }
            } else console.log(error)
        }
    }
)
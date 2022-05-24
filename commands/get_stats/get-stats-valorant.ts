import {MessageEmbed} from "discord.js";
import {fetchHTML} from "../../dependencies/helpers/fetchHTML";
import {Category, Command} from "../../dependencies/classes/Command";
import {Cheerio, CheerioAPI} from "cheerio";

export const getStatsValorant = new Command(
    'get-stats-valorant',
    'retrieves valorant stats from tracker.gg',
    async (client, interaction) => {
        // retrieve username and tag
        let user = interaction.options._hoistedOptions[0].value
        let tag = interaction.options._hoistedOptions[1].value
        let uriUser = encodeURIComponent(user.trim()) // encode string to have URI value for URL
        let uriTag = encodeURIComponent(tag.trim())
        // GET web page for user
        try {
            const $: CheerioAPI = await fetchHTML(`https://tracker.gg/valorant/profile/riot/${uriUser}%23${uriTag}/overview`);
            // retrieve stats via their classes
            let statHeaderClass = $('.stat__value')
            let rank = statHeaderClass.first().text();
            let kad = statHeaderClass.last().text();
            let stats = []; // array to store all values of the .value class
            $('.value').each(function (i) { // sort .value items into array
                stats[i] = $(this).text();
            });

            // create Embed w/ user info and stats
            const embed = new MessageEmbed()
                .setTitle(`${user}'s Valorant Stats (Past 20 Games)`)
                .addFields(
                    { name: 'RANK', value: rank.toString(), inline: true }, // stats[5] = ADR
                    { name: 'KAD', value: kad.toString(), inline: true }, // stats[6] = K/D
                    { name: 'Headshot %', value: stats[7].toString(), inline: true }, // stats[7] = Headshot%
                    { name: 'Win %', value: stats[8].toString(), inline: true }, // stats[8] = Win %
                    { name: 'Wins', value: stats[9].toString(), inline: true }, // stats[9] = Wins
                    { name: 'Kills', value: stats[10].toString(), inline: true }, // stats[10] = Kills
                    { name: 'Headshots', value: stats[11].toString(), inline: true }, // stats[11] = Headshots
                    { name: 'Deaths', value: stats[12].toString(), inline: true }, // stats[12] = Deaths
                    { name: 'Assists', value: stats[13].toString(), inline: true }, // stats[13] = Assist
                    { name: 'Score/Round', value: stats[14].toString(), inline: true }, // stats[14] = Score/Round
                    { name: 'Kills/Rounds', value: stats[15].toString(), inline: true }, // stats[15] = Kills/Rounds
                    { name: 'First Bloods', value: stats[16].toString(), inline: true }, // stats[16] = First Bloods
                    { name: 'Aces', value: stats[17].toString(), inline: true }, // stats[17] = Aces
                    { name: 'Clutches', value: stats[18].toString(), inline: true }, // stats[18] = Clutches
                    // { name: 'Flawless',             value: stats[19].toString(), inline: true }, // stats[19] = Flawless
                    { name: 'Most Kills (Match)', value: stats[20].toString(), inline: true }, // stats[20] = Most Kills (Match)
                )
                .setColor("#8570C1")
                .setFooter('via Tracker.gg, visit the website for more info')

            await interaction.editReply({ embeds: [embed] })
        }
        catch (error) {
            console.log(error.response)
            console.log('invalid username / no tracker.gg connection');
            return interaction.editReply('Invalid username / tracker.gg profile private')
        }
    }
)
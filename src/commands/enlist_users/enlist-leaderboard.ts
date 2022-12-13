import {CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {embedColor, EnlistLeaderboardUser, GuildSchema, NewClient} from "../../dependencies/myTypes";

//TODO if user changes username, does it affect any commands?
/*
 Ranking Algorithm
 methodology: 
    (Enlist/Reject percentage * percentage weight) + (normalizedEnlists * enlist weight) - (ignore percentage * ignore weight)
    - Enlist value requires normalization bc value its technically infinite
    
        sum normalization: 
        Let A be an attribute which we want to maximize, and its elements are [a1, a2 ... an], 1<a<n
            ai / sum(A) = maximizeFunc(ai, A)
            ex) several cars with several mpgs. normalize by dividing one mpg by the sum mpg of all other cars mpgs
                             
        Apply weights 
        (weights determined by you, e.g. 1 for percentage and 0.75 for enlist totals
            1. as it is: directly multiply the weights to the optimized score
            2. sum: normalize weight via sum logic then multiply
            3. max: normalize weight by max logic, then multiply

*/
export const enlistLeaderboard = {
    data: new SlashCommandBuilder()
        .setName('enlist-leaderboard')
        .setDescription('Displays top 3 and bottom 3 gamers')
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display the leaderboard or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema) {
        let ephemeralSetting
        let hideOption = interaction.options.data.find(option => option.name === 'hide')
        if (hideOption === undefined) ephemeralSetting = true
        else ephemeralSetting = hideOption.value

        let userData = guildData.UserData
        let percentageWeight: number = .9,
            enlistWeight: number = 1,
            ignoreWeight: number = 0 // using ignore values in rank calculations generated very odd leaderboards

        let totalEnlistValue: number = 0
        for (const user of userData) {
            let enlists: number = user.enlistStats.enlists
            let rejects: number = user.enlistStats.rejects
            totalEnlistValue += (enlists + rejects)
        }

        let userArray: EnlistLeaderboardUser[] = []
        for (const user of userData) {
            let enlistPercentage: number,
                rejectPercentage: number,
                ignorePercentage: number,
                enlists: number = user.enlistStats.enlists,
                rejects: number = user.enlistStats.rejects,
                ignores: number = user.enlistStats.ignores
            let totalOfValues: number = enlists + rejects + ignores

            if (rejects === 0) enlistPercentage = 1
            else enlistPercentage = (enlists / totalOfValues)

            if (enlists === 0) rejectPercentage = 1
            else rejectPercentage = (rejects / totalOfValues)

            if (enlists === 0 && rejects === 0) ignorePercentage = 100
            else ignorePercentage = (ignores / totalOfValues) * 100

            let normalizedEnlistValue: number = enlists / totalEnlistValue,
                normalizedRejectValue: number = rejects / totalEnlistValue

            // ensures no values return NaN (in case of 0 values)
            if (isNaN(enlistPercentage)) {
                enlistPercentage = 0
            }
            if (isNaN(rejectPercentage)) {
                rejectPercentage = 0
            }
            if (isNaN(normalizedEnlistValue)) {
                normalizedEnlistValue = 0
            }
            if (isNaN(normalizedRejectValue)) {
                normalizedRejectValue = 0
            }
            if (isNaN(ignorePercentage)) {
                ignorePercentage = 0
            }

            let adjustedEnlistPercentage: number = enlistPercentage * percentageWeight,
                adjustedRejectPercentage: number = rejectPercentage * percentageWeight,
                adjustedEnlistValue: number = normalizedEnlistValue * enlistWeight,
                adjustedRejectValue: number = normalizedRejectValue * enlistWeight
            // adjustedIgnoreValue: number = ignorePercentage * ignoreWeight

            let adjustedEnlistRank: number = adjustedEnlistPercentage + adjustedEnlistValue
            let adjustedRejectRank: number = adjustedRejectPercentage + adjustedRejectValue

            let leaderboardUser: EnlistLeaderboardUser = {
                name: user.username,
                enlists: enlists,
                rejects: rejects,
                enlistPercentage: enlistPercentage,
                rejectPercentage: rejectPercentage,
                adjustedEnlistRankValue: adjustedEnlistRank,
                adjustedRejectRankValue: adjustedRejectRank,
            }
            userArray.push(leaderboardUser)
        }
        userArray = userArray.filter(user => (user.enlists + user.rejects >= 10)) // reduce outliers
        if (userArray.length == 0) {
            return interaction.reply({
                content: 'No users have enlisted more than 10 times.',
                ephemeral: ephemeralSetting
            })
        } else if (userArray.length < 3) {
            return interaction.reply({
                content: 'Not enough users have enlisted more than 10 times (need at least 3).',
                ephemeral: ephemeralSetting
            })
        }

        // 2d arrays that store names, percentages, and total enlist values
        let topNames: string[] = [], topPercentages = [], topTotals = []
        let bottomNames: string[] = [], bottomPercentages = [], bottomTotals = []
        let top3Gamers: Array<string[]> = [topNames, topPercentages, topTotals],
            top3Losers: Array<string[]> = [bottomNames, bottomPercentages, bottomTotals]

        // have to separate rankings into 2 loops because userArray needs to be sorted differently for each Ranking
        let enlistRankings: EnlistLeaderboardUser[] = userArray.sort((a, b) => (b.adjustedEnlistRankValue - a.adjustedEnlistRankValue))
        for (let i = 0; i < 3; i++) {
            top3Gamers[0].push(`**${i + 1}.** ${enlistRankings[i].name}\n`,)
            top3Gamers[1].push(`**${i + 1}.** ${(enlistRankings[i].enlistPercentage * 100).toFixed(2)}\n`)
            top3Gamers[2].push(`**${i + 1}.** ${enlistRankings[i].enlists + enlistRankings[i].rejects}\n`)
        }
        let rejectRankings: EnlistLeaderboardUser[] = userArray.sort((a, b) => (a.adjustedRejectRankValue < b.adjustedRejectRankValue ? 1 : -1))
        for (let i = 0; i < 3; i++) {
            top3Losers[0].push(`**${i + 1}.** ${rejectRankings[i].name}\n`)
            top3Losers[1].push(`**${i + 1}.** ${(rejectRankings[i].rejectPercentage * 100).toFixed(2)}\n`,)
            top3Losers[2].push(`**${i + 1}.** ${rejectRankings[i].enlists + rejectRankings[i].rejects}\n`)
        }

        const embed = new EmbedBuilder()
            .setTitle(`Enlist Leaderboard`)
            .addFields([
                {name: 'Top 3 Gamers⠀⠀⠀⠀⠀', value: top3Gamers[0].join(''), inline: true},
                {name: 'Enlist Percentage⠀⠀⠀', value: top3Gamers[1].join(''), inline: true},
                {name: 'Total Interactions', value: top3Gamers[2].join(''), inline: true},
                {name: 'Top 3 Cringelords', value: top3Losers[0].join(''), inline: true},
                {name: 'Reject Percentage', value: top3Losers[1].join(''), inline: true},
                {name: 'Total Interactions', value: top3Losers[2].join(''), inline: true},
            ])
            .setColor(embedColor)
            .setFooter({text: 'Users with less than 10 interactions are not included on this leaderboard'})

        await interaction.reply({ephemeral: ephemeralSetting, embeds: [embed]})
    }

}
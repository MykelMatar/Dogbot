import {Command} from "../../dependencies/classes/Command";
import {MessageEmbed} from "discord.js";

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

export const enlistLeaderboard = new Command(
    'enlist-leaderboard',
    'retrieves top 3 gamers and top 3 cringe lords',
    async (client, interaction) => {

        let userData = enlistLeaderboard.guildData.UserData

        if (userData.length === 0) {
            await interaction.reply({content: 'This server does not have any user data. User data is created upon interacting with the enlist prompt or playing a game'})
        } else if (userData.length === 1) {
            await interaction.reply({content: 'Cannot create a leaderboard with only 1 user, there must be at least 3 users. User data is created upon interacting with the enlist prompt or playing a game'})
        } else if (userData.length === 2) {
            await interaction.reply({content: 'Cannot create a leaderboard with only 2 users, there must be at least 3 users. User data is created upon interacting with the enlist prompt or playing a game'})
        }

        // get total amount of enlists for normalization later
        let totalEnlistValue: number = 0
        for (const user of userData) {
            let enlists = user.enlistStats.enlists
            let rejects = user.enlistStats.rejects

            totalEnlistValue += (enlists + rejects)
        }

        // declare  weights (use 'as it is' / no normalization)
        let percentageWeight = .8,
            enlistWeight = 1,
            ignoreWeight = .75

        let tempUsers: User[] = []
        for (const user of userData) {
            let enlistPercentage, rejectPercentage, ignorePercentage
            let enlists: number = user.enlistStats.enlists,
                rejects: number = user.enlistStats.rejects,
                ignores: number = user.enlistStats.ignores
            let userTotalValue = enlists + rejects

            if (rejects === 0) enlistPercentage = 1
            else enlistPercentage = (enlists / userTotalValue)

            if (enlists === 0) rejectPercentage = 1
            else rejectPercentage = (rejects / userTotalValue)

            if (enlists === 0 && rejects === 0) ignorePercentage = 100
            else ignorePercentage = (ignores / user) * 100

            let normalizedEnlistValue: number = enlists / totalEnlistValue,
                normalizedRejectValue: number = rejects / totalEnlistValue

            let adjustedEnlistPercentage = enlistPercentage * percentageWeight,
                adjustedRejectPercentage = rejectPercentage * percentageWeight,
                adjustedEnlistValue = normalizedEnlistValue * enlistWeight,
                adjustedIgnoreValue = ignorePercentage * ignoreWeight

            let adjustedEnlistRank: number = adjustedEnlistPercentage + adjustedEnlistValue - adjustedIgnoreValue
            let adjustedRejectRank: number = adjustedRejectPercentage + adjustedEnlistValue - adjustedIgnoreValue

            if (isNaN(adjustedEnlistRank)) {
                adjustedEnlistRank = 0
            }
            if (isNaN(adjustedRejectRank)) {
                adjustedRejectRank = 0
            }

            let tempUser: User = {
                name: user.username,
                enlists: enlists,
                rejects: rejects,
                enlistPercentage: enlistPercentage,
                rejectPercentage: rejectPercentage, // this + all above properties are for printing in embed
                adjustedEnlistRankValue: adjustedEnlistRank,
                adjustedRejectRankValue: adjustedRejectRank,
            }

            tempUsers.push(tempUser)
        }
        tempUsers = tempUsers.filter(user => (user.enlists + user.rejects >= 5)) // only include users with > 5 enlists to reduce outliers

        // 2d arrays that store names, percentages, and total enlist values
        let names1 = [], percentages1 = [], totals1 = []
        let names2 = [], percentages2 = [], totals2 = []
        let top3Gamers = [names1, percentages1, totals1],
            top3Losers = [names2, percentages2, totals2]

        // have to seperate rankings into 2 loops because of issue declaring both rankings as tempUsers.sort()
        let enlistRankings: User[] = tempUsers.sort((a, b) => (b.adjustedEnlistRankValue - a.adjustedEnlistRankValue))
        for (let i = 0; i < 3; i++) {
            top3Gamers[0].push(`**${i + 1}.** ${enlistRankings[i].name}\n`,)
            top3Gamers[1].push(`**${i + 1}.** ${(enlistRankings[i].enlistPercentage * 100).toFixed(2)}\n`)
            top3Gamers[2].push(`**${i + 1}.** ${enlistRankings[i].enlists + enlistRankings[i].rejects}\n`)
        }

        let rejectRankings: User[] = tempUsers.sort((a, b) => (a.adjustedRejectRankValue < b.adjustedRejectRankValue ? 1 : -1))
        console.log(rejectRankings)
        for (let i = 0; i < 3; i++) {
            top3Losers[0].push(`**${i + 1}.** ${rejectRankings[i].name}\n`)
            top3Losers[1].push(`**${i + 1}.** ${(rejectRankings[i].rejectPercentage * 100).toFixed(2)}\n`,)
            top3Losers[2].push(`**${i + 1}.** ${rejectRankings[i].enlists + rejectRankings[i].rejects}\n`)
        }


        const embed = new MessageEmbed()
            .setTitle(`Enlist Leaderboard`)
            .addFields([
                {name: 'Top 3 Gamers⠀⠀⠀⠀⠀', value: top3Gamers[0].join(''), inline: true},
                {name: 'Enlist Percentage⠀⠀⠀', value: top3Gamers[1].join(''), inline: true},
                {name: 'Total Interactions', value: top3Gamers[2].join(''), inline: true},
                {name: 'Top 3 Cringelords', value: top3Losers[0].join(''), inline: true},
                {name: 'Reject Percentage', value: top3Losers[1].join(''), inline: true},
                {name: 'Total Interactions', value: top3Losers[2].join(''), inline: true},
            ])
            .setColor("#8570C1")
            .setFooter({text: 'Users with less than 5 interactions are not included on this leaderboard'})

        let ephemeralSetting
        let hideOption = interaction.options.data.find(option => option.name === 'hide')
        if (hideOption === undefined) ephemeralSetting = true
        else ephemeralSetting = hideOption.value

        await interaction.reply({ephemeral: ephemeralSetting, embeds: [embed]})
    }
)

interface User {
    name: string,
    enlists: number,
    rejects: number,
    enlistPercentage: number
    rejectPercentage: number
    adjustedEnlistRankValue: number
    adjustedRejectRankValue: number

}
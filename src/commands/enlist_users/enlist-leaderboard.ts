import {Command} from "../../dependencies/classes/Command";
import {MessageEmbed} from "discord.js";

//TODO if user changes username, does it affect any commands?

export const enlistLeaderboard = new Command(
    'enlist-leaderboard',
    'retrieves top 3 gamers and top 3 cringe lords',
    async (client, interaction) => {

        let userData = enlistLeaderboard.guildData.UserData

        if (userData.length === 0) {
            await interaction.reply({content: 'This server does not have any user data. User data is created upon interacting with the enlist prompt or playing a game'})
        } else if (userData.length === 1) {
            await interaction.reply({content: 'Cannot create a leaderboard with only 1 user. There must be at least 3 users. User data is created upon interacting with the enlist prompt or playing a game'})
        } else if (userData.length === 2) {
            await interaction.reply({content: 'Cannot create a leaderboard with only 2 users. There must be at least 3 users. User data is created upon interacting with the enlist prompt or playing a game'})
        }

        let tempUsers: User[] = []
        for (const user of userData) {
            let enlistValue = user.enlistStats.enlists
            let rejectValue = user.enlistStats.rejects
            let enlistPercentage, rejectPercentage

            let totalValue = enlistValue + rejectValue
            if (rejectValue === 0) enlistPercentage = 100
            else enlistPercentage = (enlistValue / totalValue) * 100

            if (enlistValue === 0) rejectPercentage = 100
            else rejectPercentage = (rejectValue / totalValue) * 100


            let tempUser: User = {
                name: user.username,
                enlists: enlistValue,
                rejects: rejectValue,
                enlistPercentage: enlistPercentage,
                rejectPercentage: rejectPercentage
            }

            tempUsers.push(tempUser)
        }
        
        tempUsers = tempUsers.filter(user => (user.enlists + user.rejects > 4)) // only include users with > 5 enlists to reduce outliers 
        
        let enlistRankings: User[] = tempUsers.sort((a, b) => (a.enlistPercentage > b.enlistPercentage ? 1 : -1))
        let rejectRankings: User[] = tempUsers.sort((a, b) => (a.rejectPercentage < b.rejectPercentage ? 1 : -1))
        console.log({enlistRankings})
        
        let topTied: User[] = []

        let top3GamerNames: string[] = [],
            top3GamerPercentages: string[] = [],
            top3GamerInteractions: string[] = [],
            top3CringeNames: string[] = [],
            top3CringePercentages: string[] = [],
            top3CringeInteractions: string[] = []

        // handle ties
        for (let i = 0; i < enlistRankings.length; i++) {
            if (enlistRankings[i + 1] === undefined) break
            if (enlistRankings[i + 1].enlistPercentage === enlistRankings[i].enlistPercentage) {
                topTied.push(enlistRankings[i])
                topTied.push(enlistRankings[i + 1])
            }
        }

        // filter duplicate users
        topTied = topTied.filter((user, i) => topTied.indexOf(user) === i)

        // handle cases where there are no ties or ties are less than 3
        if (topTied.length !== 0) {
            topTied = topTied.sort((a, b) => ((a.enlists + a.rejects) > (b.enlists + b.rejects) ? 1 : -1))
        } else if (topTied.length === 0) {
            topTied.unshift(enlistRankings[enlistRankings.length-1])
            topTied.unshift(enlistRankings[enlistRankings.length-2])
            topTied.unshift(enlistRankings[enlistRankings.length-3])
        } else if (topTied.length === 1) {
            topTied.unshift(enlistRankings[enlistRankings.length-2])
            topTied.unshift(enlistRankings[enlistRankings.length-3])
        } else if (topTied.length === 2) {
            topTied.unshift(enlistRankings[enlistRankings.length-3])
        }

        // push users and values to arrays for display in embed
        for (let i = 0; i < 3; i++) {
            top3GamerNames.push(`**${i + 1}.** ${topTied[(topTied.length - (i + 1))].name}\n`,)
            top3GamerPercentages.push(`**${i + 1}.** ${topTied[(topTied.length - (i + 1))].enlistPercentage.toFixed(2)}\n`)
            top3GamerInteractions.push(`**${i + 1}.** ${topTied[(topTied.length - (i + 1))].enlists + topTied[(topTied.length - (i + 1))].rejects}\n`)
            top3CringeNames.push(`**${i + 1}.** ${rejectRankings[i].name}\n`)
            top3CringePercentages.push(`**${i + 1}.** ${rejectRankings[i].rejectPercentage.toFixed(2)}\n`,)
            top3CringeInteractions.push(`**${i + 1}.** ${rejectRankings[i].enlists + rejectRankings[i].rejects}\n`)
        }

        const embed = new MessageEmbed()
            .setTitle(`Enlist Leaderboard`)
            .addFields([
                {name: 'Top 3 Gamers⠀⠀⠀⠀⠀', value: top3GamerNames.join(''), inline: true},
                {name: 'Enlist Percentage⠀⠀⠀', value: top3GamerPercentages.join(''), inline: true},
                {name: 'Total Interactions', value: top3GamerInteractions.join(''), inline: true},
                {name: 'Top 3 Cringelords', value: top3CringeNames.join(''), inline: true},
                {name: 'Reject Percentage', value: top3CringePercentages.join(''), inline: true},
                {name: 'Total Interactions', value: top3CringeInteractions.join(''), inline: true},
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
}

function getDuplicates<T>(input: T[]): Map<T, number[]> {
    return input.reduce((output, element, idx) => {
        const recordedDuplicates = output.get(element);
        if (recordedDuplicates) {
            output.set(element, [...recordedDuplicates, idx]);
        } else if (input.lastIndexOf(element) !== idx) {
            output.set(element, [idx]);
        }

        return output;
    }, new Map<T, number[]>());
}


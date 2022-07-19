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

        let enlistRankings: User[] = tempUsers.sort((a, b) => (a.enlistPercentage > b.enlistPercentage ? 1 : -1))
        let rejectRankings: User[] = tempUsers.sort((a, b) => (a.rejectPercentage < b.rejectPercentage ? 1 : -1))

        let userEnlistFirst = enlistRankings[enlistRankings.length-1]
        let userEnlistSecond = enlistRankings[enlistRankings.length-2]
        let userEnlistThird = enlistRankings[enlistRankings.length-3]
        let userRejectFirst = rejectRankings[0]
        let userRejectSecond = rejectRankings[1]
        let userRejectThird = rejectRankings[2]

        console.log({enlistRankings})

        let top3GamerNames = [
            `**1.** ${userEnlistFirst.name}\n`, 
            `**2.** ${userEnlistSecond.name}\n`, 
            `**3.** ${userEnlistThird.name}\n`
        ]
        let top3GamerPercentages = [
            `**1.** ${userEnlistFirst.enlistPercentage.toFixed(2)}\n`, 
            `**2.** ${userEnlistSecond.enlistPercentage.toFixed(2)}\n`, 
            `**3.** ${userEnlistThird.enlistPercentage.toFixed(2)}\n`
        ]
        let top3CringeNames = [
            `**1.** ${userRejectFirst.name}\n`, 
            `**2.** ${userRejectSecond.name}\n`, 
            `**3.** ${userRejectThird.name}\n`
        ]
        let top3CringePercentages = [
            `**1.** ${userRejectFirst.enlistPercentage.toFixed(2)}\n`,
            `**2.** ${userRejectSecond.enlistPercentage.toFixed(2)}\n`,
            `**3.** ${userRejectThird.enlistPercentage.toFixed(2)}\n`
        ]

        const embed = new MessageEmbed()
            .setTitle(`Enlist Leaderboard`)
            .addFields([
                {name: 'Top 3 Gamers', value: top3GamerNames.join(''), inline: true},
                {name: 'Enlist Percentage', value: top3GamerPercentages.join(''), inline: true},
                {name: '⠀', value: '⠀', inline: true},
                {name: 'Top 3 Cringelords', value: top3CringeNames.join(''), inline: true},
                {name: 'Reject Percentage', value: top3CringePercentages.join(''), inline: true},
                {name: '⠀', value: '⠀', inline: true},
            ])
            .setColor("#8570C1")

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


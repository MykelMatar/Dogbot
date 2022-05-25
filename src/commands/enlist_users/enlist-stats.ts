import {Command} from "../../dependencies/classes/Command";
import {MessageEmbed} from "discord.js";

// TODO: add command for users who 'enlist' but never attend (admin controlled)
export const enlistStats = new Command(
    'enlist-stats',
    'shows how many times a user enlisted and rejected the Enlist prompt',
    async (client, interaction) => {

        // set user whose data is being retrieved
        let username
        let userId: any = (interaction.options.data.find(option => option.name === 'user')) // any is used bc it can be lots of different types
        if (userId == undefined) {
                username = interaction.user.username
                userId = interaction.user.id
        }
        else userId = userId.value

        // retrieve user data from mongo
        let userData = enlistStats.guildData.UserData.find(user => user.id === userId)
        if (userData === undefined) return interaction.reply({
            ephemeral: true,
            content: 'User does not have any data. Data is only created for users who have enlisted, rejected, or played a game'
        })

        // get enlist stats
        let enlistRatio: number, socialStatus: string
        const enlistValue: number = userData.enlistStats.enlists
        const rejectValue: number = userData.enlistStats.rejects

        // find enlist-to-reject ratio
        if (rejectValue !== 0) enlistRatio = (enlistValue / rejectValue) 
        else enlistRatio = enlistValue 

        // determine social status
        if (enlistValue > rejectValue * 10 && rejectValue !== 0) socialStatus = 'epic gamer'
        else if (enlistValue > rejectValue) socialStatus = 'cool'
        else if (enlistValue < rejectValue) socialStatus = 'cringe'
        else if (enlistValue * 10 < rejectValue && enlistValue !== 0) socialStatus = 'super cringe'
        else if (enlistValue === rejectValue && enlistValue !== 0) socialStatus = 'meh'
        else if (enlistValue === 0 && rejectValue === 0) socialStatus = 'TBD'

        const embed = new MessageEmbed()
            .setTitle(`${username}'s Enlist Stats`)
            .addFields([
                {name: 'Enlists ✅', value: enlistValue.toString(), inline: true},
                {name: 'Rejects ❌', value: rejectValue.toString(), inline: true},
                {name: 'Ratio', value: enlistRatio.toString(), inline: true},
                {name: 'Cool or Cringe', value: socialStatus, inline: false},
            ])

        let ephemeralSetting
        let hideOption = interaction.options.data.find(option => option.name === 'hide')
        if (hideOption === undefined) ephemeralSetting = true
        else ephemeralSetting = hideOption.value

        await interaction.reply({ephemeral: ephemeralSetting, embeds: [embed]})
    }
)
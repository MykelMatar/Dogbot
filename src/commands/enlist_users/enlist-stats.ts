import {Command} from "../../dependencies/classes/Command";
import {CommandInteractionOption, MessageEmbed} from "discord.js";


// TODO: add command for users who 'enlist' but never attend (admin controlled)
// TODO: give commendations for users (frequent gamer, infrequent gamer, liar, etc)
export const enlistStats = new Command(
    'enlist-stats',
    'shows how many times a user enlisted and rejected the Enlist prompt',
    async (client, interaction) => {

        // set user whose data is being retrieved
        let username: string, userId: string
        let user: CommandInteractionOption = (interaction.options.data.find(option => option.name === 'user'));
        if (user == undefined) {
            username = interaction.user.username
            userId = interaction.user.id
        } else {
            username = user.user.username
            userId = (user.value).toString()
        }

        // retrieve user data from mongo
        let userData = enlistStats.guildData.UserData.find(user => user.id === userId)
        if (userData === undefined) {
            return interaction.reply({
                ephemeral: true,
                content: 'User does not have any data. Data is only created for users who have enlisted, rejected, or played a game'
            })
        }

        // get enlist stats
        let enlistRatio: number, socialStatus: string, commendation: string
        const enlistValue: number = userData.enlistStats.enlists
        const rejectValue: number = userData.enlistStats.rejects

        // find enlist-to-reject ratio
        if (rejectValue !== 0) enlistRatio = (enlistValue / rejectValue)
        else enlistRatio = enlistValue

        // determine social status and commendation
        if ((enlistValue > (rejectValue + 1) * 10 && rejectValue !== 0)) {
            socialStatus = 'epic gamer 😎' // add 1 to avoid multiplication by 0
            commendation = 'frequent gamer'
        } else if (enlistValue > rejectValue) {
            socialStatus = 'cool'
            commendation = 'usually games'
        } else if (enlistValue < rejectValue) {
            socialStatus = 'cringe'
            commendation = 'infrequent gamer'
        } else if (((enlistValue + 1) * 10 < rejectValue && enlistValue !== 0)) {
            socialStatus = 'giga cringelord'
            commendation = 'never games (cringe)'
        } else if (enlistValue === rejectValue && enlistValue !== 0) {
            socialStatus = 'meh'
            commendation = 'wildcard'
        } else if (enlistValue === 0 && rejectValue === 0) {
            socialStatus = 'TBD'
            commendation = 'TBD'
        } else {
            socialStatus = 'stat machine broke'
            commendation = '?'
        }

        const embed = new MessageEmbed()
            .setTitle(`${username}'s Enlist Stats`)
            .addFields([
                {name: 'Enlists ✅', value: enlistValue.toString(), inline: true},
                {name: 'Rejects ❌', value: rejectValue.toString(), inline: true},
                {name: 'Ratio', value: enlistRatio.toString(), inline: true},
                {name: 'Cool or Cringe?', value: socialStatus, inline: false},
                {name: 'Commendation', value: commendation, inline: true}
            ])
            .setColor("#8570C1")

        let ephemeralSetting
        let hideOption = interaction.options.data.find(option => option.name === 'hide')
        if (hideOption === undefined) ephemeralSetting = true
        else ephemeralSetting = hideOption.value

        await interaction.reply({ephemeral: ephemeralSetting, embeds: [embed]})
    }
)
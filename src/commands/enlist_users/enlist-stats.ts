import {CommandInteraction, CommandInteractionOption, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {newClient} from "../../dependencies/myTypes";

export const enlistStats = {
    data: new SlashCommandBuilder() 
        .setName('enlist-stats')
        .setDescription('Displays users enlist stats')
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to hide the response or not')
                .setRequired(false)),
        
    async execute(client: newClient, interaction: CommandInteraction, guildData){
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
        let userData = guildData.UserData.find(user => user.id === userId)
        if (userData === undefined) {
            return interaction.reply({
                ephemeral: true,
                content: 'User does not have any data. Data is only created for users who have enlisted, rejected, or played a game'
            })
        }

        // get enlist stats
        let enlistRatio: string, socialStatus: string, commendation: string
        const enlistValue: number = userData.enlistStats.enlists
        const rejectValue: number = userData.enlistStats.rejects
        const ignoreValue: number = userData.enlistStats.ignores

        // find enlist-to-reject ratio
        if (rejectValue !== 0) enlistRatio = (enlistValue / rejectValue).toFixed(2)
        else enlistRatio = enlistValue.toFixed(2)

        let enlistPercentage, rejectPercentage, ignorePercentage
        let totalValue = enlistValue + rejectValue + ignoreValue

        if (rejectValue === 0) enlistPercentage = 100
        else enlistPercentage = (enlistValue / totalValue) * 100

        if (enlistValue === 0) rejectPercentage = 100
        else rejectPercentage = (rejectValue / totalValue) * 100

        if (enlistValue === 0 && rejectValue === 0) ignorePercentage = 100
        else ignorePercentage = (ignoreValue / totalValue) * 100


        // determine social status and commendation
        if (ignoreValue > enlistValue + rejectValue) {
            socialStatus = 'rude'
            commendation = 'pro donoWaller'
        } else if (enlistValue > (rejectValue + 1) * 10) { // add 1 to avoid multiplication by 0
            socialStatus = 'epic gamer 😎'
            commendation = 'frequent gamer'
        } else if (enlistValue > rejectValue) {
            socialStatus = 'cool'
            commendation = 'usually games'
        } else if ((enlistValue + 1) * 10 < rejectValue) {
            socialStatus = 'giga cringelord'
            commendation = 'never games (cringe)'
        } else if (enlistValue < rejectValue) {
            socialStatus = 'cringe'
            commendation = 'infrequent gamer'
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

        const embed = new EmbedBuilder()
            .setTitle(`${username}'s Enlist Stats`)
            .addFields([
                {name: 'Enlists ✓', value: enlistValue.toString(), inline: true},
                {name: 'Rejects ✕', value: rejectValue.toString(), inline: true},
                {name: 'Ignores ~', value: ignoreValue.toString(), inline: true},
                {
                    name: 'Enlist to Reject Ratio',
                    value: `**${enlistRatio}**
                            -------------------- 
                            *${enlistPercentage.toFixed(2)}% enlist rate*
                            *${rejectPercentage.toFixed(2)}% reject rate*
                            *${ignorePercentage.toFixed(2)}% ignore rate*`,
                    inline: false
                },
                {name: 'Cool or Cringe?⠀⠀', value: socialStatus, inline: true},
                {name: 'Commendation', value: commendation, inline: true}
            ])
            .setColor("#8570C1")

        let ephemeralSetting
        let hideOption = interaction.options.data.find(option => option.name === 'hide')
        if (hideOption === undefined) ephemeralSetting = true
        else ephemeralSetting = hideOption.value

        await interaction.reply({ephemeral: ephemeralSetting, embeds: [embed]})
    }
}
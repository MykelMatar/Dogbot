import {CommandInteraction, CommandInteractionOption, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {embedColor, GuildSchema, NewClient} from "../../dependencies/myTypes";

export const enlistStats = {
    data: new SlashCommandBuilder()
        .setName('enlist-stats')
        .setDescription('Displays users enlist stats')
        .addUserOption(option =>
            option.setName('user')
                .setDescription("User's stats to display. Default is yourself. ")
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to hide the response or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema) {
        const hideOption = interaction.options.data.find(option => option.name === 'hide');
        const ephemeralSetting = hideOption === undefined ? true : hideOption.value;
        
        let userOption: CommandInteractionOption = (interaction.options.data.find(option => option.name === 'user'));
        const username = userOption?.user.username ?? interaction.user.username;
        const userId = userOption?.value?.toString() ?? interaction.user.id;

        let userData = guildData.UserData.find(user => user.id === userId)
        if (!userData) {
            return interaction.reply({
                ephemeral: true,
                content: 'User does not have any data. Data is only created for users who have enlisted, rejected, or retrieved game stats'
            })
        }

        let enlistRatio: string, socialStatus: string, commendation: string
        const {enlists: enlistValue, rejects: rejectValue, ignores: ignoreValue} = userData.enlistStats;
        enlistRatio = (rejectValue !== 0) ? (enlistValue / rejectValue).toFixed(2) : enlistValue.toFixed(2);

        let totalValue = enlistValue + rejectValue + ignoreValue
        let enlistPercentage = rejectValue === 0 ? 100 : (enlistValue / totalValue) * 100
        let rejectPercentage = enlistValue === 0 ? 100 : (rejectValue / totalValue) * 100
        let ignorePercentage = enlistValue === 0 && rejectValue === 0 ? 100 : (ignoreValue / totalValue) * 100

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
            .setColor(embedColor)

        await interaction.reply({ephemeral: ephemeralSetting as boolean, embeds: [embed]})
    }
}
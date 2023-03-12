import {CommandInteraction, CommandInteractionOption, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {embedColor, IGuild, NewClient} from "../../dependencies/myTypes";
import {getLevelFromXp} from "../../dependencies/helpers/getLevelFromXp";

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

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        const hideOption = interaction.options.data.find(option => option.name === 'hide');
        const ephemeralSetting = hideOption === undefined ? true : hideOption.value;

        const userOption: CommandInteractionOption = (interaction.options.data.find(option => option.name === 'user'));
        const username = userOption?.user.username ?? interaction.user.username;
        const userId = userOption?.value?.toString() ?? interaction.user.id;

        let userData = guildData.userData.find(user => user.id === userId)
        if (!userData) {
            return interaction.reply({
                ephemeral: true,
                content: 'User does not have any data. Data is created upon enlisting, rejecting, or setting a game profile'
            })
        }

        const {prestige, level} = getLevelFromXp(userData.enlistStats.enlistXP)
        const {enlists: enlistValue, rejects: rejectValue, ignores: ignoreValue} = userData.enlistStats;

        const embed = new EmbedBuilder()
            .setTitle(`${username}'s Enlist Stats`)
            .setDescription(`${prestige} level ${level}`)
            .addFields([
                {name: 'Enlists ✓', value: enlistValue.toString(), inline: true},
                {name: 'Rejects ✘', value: rejectValue.toString(), inline: true},
                {name: 'Ignores ~', value: ignoreValue.toString(), inline: true}
            ])
            .setColor(embedColor)

        await interaction.reply({ephemeral: ephemeralSetting as boolean, embeds: [embed]})
    }
}
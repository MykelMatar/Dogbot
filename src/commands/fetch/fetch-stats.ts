import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    GuildMember,
    SlashCommandBuilder
} from "discord.js";
import {CustomClient, embedColor, MongoGuild, SlashCommand} from "../../dependencies/myTypes";
import {getLevelFromXp} from "../../dependencies/helpers/fetchHelpers/getLevelFromXp";

export const fetchStats: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('fetch-stats')
        .setDescription('Displays users fetch stats')
        .addUserOption(option =>
            option.setName('user')
                .setDescription("User's stats to display. Default is yourself. ")
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to hide the response or not')
                .setRequired(false)),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {
        const options = interaction.options as CommandInteractionOptionResolver // ts thinks the .get options dont exist
        const user = options.getMember('user') as GuildMember
        const hide = options.getBoolean('hide', false)

        const ephemeralSetting = hide ? hide : false;
        const member = interaction.member as GuildMember;
        const username = user ? user.displayName : member.displayName
        const userId = user ? user.id : member.id

        let userData = guildData.userData.find(user => user.id === userId)
        if (!userData.fetchStats || JSON.stringify(userData.fetchStats) == '{}') {
            await interaction.reply({
                ephemeral: true,
                content: 'User does not have any data. Data is created upon interacting with the fetch-gamers prompt'
            })
            return
        }

        const {prestige, level} = getLevelFromXp(userData.fetchStats.fetchXP)
        const {
            accepts: acceptValue,
            rejects: rejectValue,
            perhaps: perhapsValue,
            ignores: ignoreValue,
            fetchStreak: fetchStreak
        } = userData.fetchStats;

        // new stat so some users might now have it
        const tempPerhapsValue = isNaN(perhapsValue) ? 0 : perhapsValue

        const embed = new EmbedBuilder()
            .setTitle(`${username}'s Fetch Stats`)
            .setDescription(`${prestige} level ${level}`)
            .addFields([
                {
                    name: 'Accepts ✓',
                    value: `${acceptValue.toString()}*(${fetchStreak.toString()}x streak)*`,
                    // inline: true
                },
                {
                    name: 'Rejects ✘',
                    value: rejectValue.toString(),
                    // inline: true
                },
                {
                    name: 'Perhaps ❔',
                    value: tempPerhapsValue.toString(),
                    // inline: true
                },
                {
                    name: 'Ignores ~',
                    value: ignoreValue.toString(),
                    // inline: true
                }
            ])
            .setColor(embedColor)

        await interaction.reply({ephemeral: ephemeralSetting as boolean, embeds: [embed]})
    }
}
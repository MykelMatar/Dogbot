import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    GuildMember,
    SlashCommandBuilder
} from "discord.js";
import {embedColor, IGuild, NewClient} from "../../dependencies/myTypes";

export const predictionStats = {
    data: new SlashCommandBuilder()
        .setName('prediction-stats')
        .setDescription('Displays your prediction stats')
        .addUserOption(option =>
            option.setName('user')
                .setDescription("User's stats to display. Default is yourself. ")
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to hide the response or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        const options = interaction.options as CommandInteractionOptionResolver // ts thinks the .get options dont exist
        const user = options.getMember('user') as GuildMember
        const hide = options.getBoolean('hide', false)

        const ephemeralSetting = hide ? hide : false;
        const member = interaction.member as GuildMember;
        const username = user ? user.displayName : member.displayName
        const userId = user ? user.id : member.id

        let userData = guildData.userData.find(user => user.id === userId)
        if (!userData.predictionStats || JSON.stringify(userData.predictionStats) == '{}') {
            return interaction.reply({
                ephemeral: true,
                content: 'User does not have any data. Data is created upon interacting with the prediction prompt'
            })
        }

        const {
            points,
            correctPredictions,
            incorrectPredictions
        } = userData.predictionStats

        const embed = new EmbedBuilder()
            .setTitle(`${username}'s Prediction Stats`)
            .addFields([
                {name: 'Points ', value: points.toString(), inline: true},
                {name: 'Correct Predictions ✓', value: correctPredictions.toString(), inline: true},
                {name: 'Incorrect Predictions ✘', value: incorrectPredictions.toString(), inline: true}
            ])
            .setColor(embedColor)

        await interaction.reply({ephemeral: ephemeralSetting, embeds: [embed]})
    }
}
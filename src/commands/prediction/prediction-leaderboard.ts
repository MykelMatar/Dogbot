import {CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {
    CustomClient,
    embedColor,
    MongoGuild,
    PredictionLeaderboardUser,
    SlashCommand
} from "../../dependencies/myTypes";

export const predictionLeaderboard: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('prediction-leaderboard')
        .setDescription('Displays leaderboard of users with the most prediction points')
        .addStringOption(option =>
            option.setName('hide')
                .setDescription('Whether to display response or not')
                .setRequired(false)),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {

        const userArray: PredictionLeaderboardUser[] = []
        for (const user of guildData.userData) {
            userArray.push({
                name: user.username,
                correctPredictions: user.predictionStats.correctPredictions,
                incorrectPredictions: user.predictionStats.incorrectPredictions,
                points: user.predictionStats.points
            })
        }
        const pointRanking = [...userArray].sort((a, b) => (b.points - a.points))
        if (pointRanking.length > 10) {
            pointRanking.splice(11)
        }
        const definedPointRanking = pointRanking.filter((a) => a.points !== undefined)

        const displayedUser = [[], [], []]
        definedPointRanking.forEach((user) => {
            displayedUser[0].push(`**${user.name}**`)
            displayedUser[1].push(`*${user.points} points*`)
            displayedUser[2].push(`*${user.correctPredictions}:${user.incorrectPredictions}*`)
        })

        const leaderboardEmbed = new EmbedBuilder()
            .setDescription('Top 10 Gambling Addicts')
            .addFields([
                {name: 'User', value: displayedUser[0].join('\n'), inline: true},
                {name: 'Points', value: displayedUser[1].join('\n'), inline: true},
                {name: 'Prediction Ratio', value: displayedUser[2].join('\n'), inline: true},
            ])
            .setColor(embedColor)

        await interaction.reply({embeds: [leaderboardEmbed]})
    }
}
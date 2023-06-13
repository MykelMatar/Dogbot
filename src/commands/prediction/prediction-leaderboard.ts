import {CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {embedColor, IGuild, NewClient, predictionLeaderboardUser} from "../../dependencies/myTypes";

export const predictionLeaderboard = {
    data: new SlashCommandBuilder()
        .setName('prediction-leaderboard')
        .setDescription('Displays leaderboard of users with the most prediction points')
        .addStringOption(option =>
            option.setName('hide')
                .setDescription('Whether to display response or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {

        const userArray: predictionLeaderboardUser[] = []
        for (const user of guildData.userData) {
            userArray.push({
                name: user.username,
                correctPredicions: user.predictionStats.correctPredictions,
                incorrectPredicions: user.predictionStats.incorrectPredictions,
                points: user.predictionStats.points
            })
        }
        const pointRanking = [...userArray].sort((a, b) => (b.points - a.points))
        if (pointRanking.length > 10) {
            pointRanking.splice(11)
        }

        const displayedUser = [[], [], []]
        pointRanking.forEach((user, index) => {
            displayedUser[0].push(`**${user.name}**`)
            displayedUser[1].push(`*${user.points} points*`)
            displayedUser[2].push(`*${user.correctPredicions}:${user.incorrectPredicions}*`)
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
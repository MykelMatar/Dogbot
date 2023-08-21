import {CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {CustomClient, embedColor, FetchLeaderboardUser, MongoGuild, SlashCommand} from "../../dependencies/myTypes";

/*
 Ranking Algorithm
 methodology: 
    (Enlist/Reject percentage * percentage weight) + (normalizedEnlists * fetch weight) - (ignore percentage * ignore weight)
    - Enlist value requires normalization bc value its technically infinite
    
        sum normalization: 
        Let A be an attribute which we want to maximize, and its elements are [a1, a2 ... an], 1<a<n
            ai / sum(A) = maximizeFunc(ai, A)
            ex) several cars with several mpgs. normalize by dividing one mpg by the sum mpg of all other cars mpgs
                             
        Apply weights 
        (weights determined by you, e.g. 1 for percentage and 0.75 for fetch totals
            1. as it is: directly multiply the weights to the optimized score
            2. sum: normalize weight via sum logic then multiply
            3. max: normalize weight by max logic, then multiply

*/
export const fetchLeaderboard: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('fetch-leaderboard')
        .setDescription('Displays top 3 and bottom 3 gamers')
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display the leaderboard or not')
                .setRequired(false)),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {
        const hideOption = interaction.options.data.find(option => option.name === 'hide')
        const ephemeralSetting = Boolean(hideOption?.value ?? true)

        const userData = guildData.userData
        const percentageWeight: number = .9
        const acceptWeight: number = 1
        const ignoreWeight: number = 0 // using ignore values in rank calculations generated very odd leaderboards

        const totalAcceptValue = userData.reduce((acc, user) => {
            const {accepts, rejects} = user.fetchStats
            return acc + accepts + rejects;
        }, 0);

        let userArray: FetchLeaderboardUser[] = []
        for (const user of userData) {
            const {accepts, rejects, ignores} = user.fetchStats
            const totalOfValues = accepts + rejects + ignores;

            let acceptPercentage = rejects === 0 ? 1 : accepts / totalOfValues;
            let rejectPercentage = accepts === 0 ? 1 : rejects / totalOfValues;
            let ignorePercentage = accepts === 0 && rejects === 0 ? 100 : (ignores / totalOfValues) * 100;

            // normalization of fetch and reject amount totals 
            let normalizedEnlistTotal = accepts / totalAcceptValue;
            let normalizedRejectTotal = rejects / totalAcceptValue;

            // avoids NaN values (in case of 0 values)
            acceptPercentage ||= 0;
            rejectPercentage ||= 0;
            normalizedEnlistTotal ||= 0;
            normalizedRejectTotal ||= 0;
            ignorePercentage ||= 0;

            // Apply weights 
            const [
                weightedEnlistPercentage,
                weightedRejectPercentage,
                weightedIgnorePercentage,
                weightedEnlistTotal,
                weightedRejectTotal
            ] = [
                acceptPercentage * percentageWeight,
                rejectPercentage * percentageWeight,
                ignorePercentage * ignoreWeight,
                normalizedEnlistTotal * acceptWeight,
                normalizedRejectTotal * acceptWeight,
            ];

            // Get final ranking value
            const [acceptRank, rejectRank] = [
                weightedEnlistPercentage + weightedEnlistTotal - weightedIgnorePercentage,
                weightedRejectPercentage + weightedRejectTotal - weightedIgnorePercentage,
            ];

            let leaderboardUser: FetchLeaderboardUser = {
                name: user.username,
                accepts: accepts,
                rejects: rejects,
                acceptPercentage: acceptPercentage,
                rejectPercentage: rejectPercentage,
                acceptRankValue: acceptRank,
                rejectRankValue: rejectRank,
            } as const
            userArray.push(leaderboardUser)
        }
        userArray = userArray.filter(user => (user.accepts + user.rejects >= 10)) // reduce outliers
        if (userArray.length == 0) {
            await interaction.reply({
                content: 'No users have interacted more than 10 times.',
                ephemeral: ephemeralSetting
            })
            return
        } else if (userArray.length < 3) {
            await interaction.reply({
                content: 'Not enough users have interacted more than 10 times (need at least 3).',
                ephemeral: ephemeralSetting
            })
            return
        }

        // 2d arrays that store names, percentages, and total fetch values for each user
        // not using objects because the arrays display vertically in the embed, meaning the values each need their own array
        let top3Gamers: string[][] = [[], [], []]
        let top3Losers: string[][] = [[], [], []]

        let acceptRankings: FetchLeaderboardUser[] = [...userArray].sort((a, b) => (b.acceptRankValue - a.acceptRankValue))
        let rejectRankings: FetchLeaderboardUser[] = [...userArray].sort((a, b) => (a.rejectRankValue < b.rejectRankValue ? 1 : -1))
        for (let i = 0; i < 3; i++) {
            top3Gamers[0].push(`**${i + 1}.** ${acceptRankings[i].name}\n`,)
            top3Gamers[1].push(`**${i + 1}.** ${(acceptRankings[i].acceptPercentage * 100).toFixed(2)}\n`)
            top3Gamers[2].push(`**${i + 1}.** ${acceptRankings[i].accepts + acceptRankings[i].rejects}\n`)
            top3Losers[0].push(`**${i + 1}.** ${rejectRankings[i].name}\n`)
            top3Losers[1].push(`**${i + 1}.** ${(rejectRankings[i].rejectPercentage * 100).toFixed(2)}\n`,)
            top3Losers[2].push(`**${i + 1}.** ${rejectRankings[i].accepts + rejectRankings[i].rejects}\n`)
        }

        const embed = new EmbedBuilder()
            .setTitle(`Enlist Leaderboard`)
            .addFields([
                {name: 'Top 3 Gamers', value: top3Gamers[0].join(''), inline: true},
                {name: 'Enlist Percentage', value: top3Gamers[1].join(''), inline: true},
                {name: 'Total Interactions', value: top3Gamers[2].join(''), inline: true},
                {name: 'Top 3 Cringelords', value: top3Losers[0].join(''), inline: true},
                {name: 'Reject Percentage', value: top3Losers[1].join(''), inline: true},
                {name: 'Total Interactions', value: top3Losers[2].join(''), inline: true},
            ])
            .setColor(embedColor)
            .setFooter({text: 'Users with less than 10 interactions are not included on this leaderboard'})

        await interaction.reply({ephemeral: ephemeralSetting, embeds: [embed]})
    }

}
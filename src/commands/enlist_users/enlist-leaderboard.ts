import {CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {embedColor, EnlistLeaderboardUser, GuildSchema, NewClient} from "../../dependencies/myTypes";

//TODO if user changes username, does it affect any commands?
/*
 Ranking Algorithm
 methodology: 
    (Enlist/Reject percentage * percentage weight) + (normalizedEnlists * enlist weight) - (ignore percentage * ignore weight)
    - Enlist value requires normalization bc value its technically infinite
    
        sum normalization: 
        Let A be an attribute which we want to maximize, and its elements are [a1, a2 ... an], 1<a<n
            ai / sum(A) = maximizeFunc(ai, A)
            ex) several cars with several mpgs. normalize by dividing one mpg by the sum mpg of all other cars mpgs
                             
        Apply weights 
        (weights determined by you, e.g. 1 for percentage and 0.75 for enlist totals
            1. as it is: directly multiply the weights to the optimized score
            2. sum: normalize weight via sum logic then multiply
            3. max: normalize weight by max logic, then multiply

*/
export const enlistLeaderboard = {
    data: new SlashCommandBuilder()
        .setName('enlist-leaderboard')
        .setDescription('Displays top 3 and bottom 3 gamers')
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display the leaderboard or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema) {
        const hideOption = interaction.options.data.find(option => option.name === 'hide')
        const ephemeralSetting = Boolean(hideOption?.value ?? true)

        const userData = guildData.UserData
        const percentageWeight: number = .9
        const enlistWeight: number = 1
        const ignoreWeight: number = 0 // using ignore values in rank calculations generated very odd leaderboards

        const totalEnlistValue = userData.reduce((acc, user) => {
            const enlists = user.enlistStats.enlists;
            const rejects = user.enlistStats.rejects;
            return acc + enlists + rejects;
        }, 0);

        let userArray: EnlistLeaderboardUser[] = []
        for (const user of userData) {
            const enlists = user.enlistStats.enlists;
            const rejects = user.enlistStats.rejects;
            const ignores = user.enlistStats.ignores;
            const totalOfValues = enlists + rejects + ignores;

            let enlistPercentage = rejects === 0 ? 1 : enlists / totalOfValues;
            let rejectPercentage = enlists === 0 ? 1 : rejects / totalOfValues;
            let ignorePercentage = enlists === 0 && rejects === 0 ? 100 : (ignores / totalOfValues) * 100;

            // normalization of enlist and reject amount totals 
            let normalizedEnlistTotal = enlists / totalEnlistValue;
            let normalizedRejectTotal = rejects / totalEnlistValue;

            // avoids NaN values (in case of 0 values)
            enlistPercentage ||= 0;
            rejectPercentage ||= 0;
            normalizedEnlistTotal ||= 0;
            normalizedRejectTotal ||= 0;
            ignorePercentage ||= 0;

            // Apply weights 
            const [weightedEnlistPercentage, weightedRejectPercentage, weightedIgnorePercentage, weightedEnlistTotal, weightedRejectTotal] = [
                enlistPercentage * percentageWeight,
                rejectPercentage * percentageWeight,
                ignorePercentage * ignoreWeight,
                normalizedEnlistTotal * enlistWeight,
                normalizedRejectTotal * enlistWeight,
            ];

            // Get final ranking value
            const [EnlistRank, RejectRank] = [
                weightedEnlistPercentage + weightedEnlistTotal - weightedIgnorePercentage,
                weightedRejectPercentage + weightedRejectTotal - weightedIgnorePercentage,
            ];

            let leaderboardUser: EnlistLeaderboardUser = {
                name: user.username,
                enlists: enlists,
                rejects: rejects,
                enlistPercentage: enlistPercentage,
                rejectPercentage: rejectPercentage,
                EnlistRankValue: EnlistRank,
                RejectRankValue: RejectRank,
            }
            userArray.push(leaderboardUser)
        }
        userArray = userArray.filter(user => (user.enlists + user.rejects >= 10)) // reduce outliers
        if (userArray.length == 0) {
            return interaction.reply({
                content: 'No users have enlisted more than 10 times.',
                ephemeral: ephemeralSetting
            })
        } else if (userArray.length < 3) {
            return interaction.reply({
                content: 'Not enough users have enlisted more than 10 times (need at least 3).',
                ephemeral: ephemeralSetting
            })
        }

        // 2d arrays that store names, percentages, and total enlist values for each user
        // not using objects because the arrays display vertically in the embed, meaning the values each need their own array
        let top3Gamers: string[][] = []
        let top3Losers: string[][] = []

        let enlistRankings: EnlistLeaderboardUser[] = [...userArray].sort((a, b) => (b.EnlistRankValue - a.EnlistRankValue))
        let rejectRankings: EnlistLeaderboardUser[] = [...userArray].sort((a, b) => (a.RejectRankValue < b.RejectRankValue ? 1 : -1))
        for (let i = 0; i < 3; i++) {
            top3Gamers[0].push(`**${i + 1}.** ${enlistRankings[i].name}\n`,)
            top3Gamers[1].push(`**${i + 1}.** ${(enlistRankings[i].enlistPercentage * 100).toFixed(2)}\n`)
            top3Gamers[2].push(`**${i + 1}.** ${enlistRankings[i].enlists + enlistRankings[i].rejects}\n`)
            top3Losers[0].push(`**${i + 1}.** ${rejectRankings[i].name}\n`)
            top3Losers[1].push(`**${i + 1}.** ${(rejectRankings[i].rejectPercentage * 100).toFixed(2)}\n`,)
            top3Losers[2].push(`**${i + 1}.** ${rejectRankings[i].enlists + rejectRankings[i].rejects}\n`)
        }

        const embed = new EmbedBuilder()
            .setTitle(`Enlist Leaderboard`)
            .addFields([
                {name: 'Top 3 Gamers⠀⠀⠀⠀⠀', value: top3Gamers[0].join(''), inline: true},
                {name: 'Enlist Percentage⠀⠀⠀', value: top3Gamers[1].join(''), inline: true},
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
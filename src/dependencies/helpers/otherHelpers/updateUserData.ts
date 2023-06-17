import guilds from "../../schemas/guild-schema";
import log from "../../constants/logger";
import {AutocompleteInteraction, CommandInteraction, Snowflake} from "discord.js";
import {MongoGuild, UserInfo, ValorantProfile} from "../../myTypes";

/**
 * updates mongoDB UserData
 *
 * @param interaction
 * @param userIdArray
 * @param infoType
 * @param profile
 * @param pointChange - amount of prediction points gained or lost
 */

export async function updateUserData(interaction: CommandInteraction | AutocompleteInteraction, userIdArray: Snowflake[], infoType: UserInfo, profile?: ValorantProfile, pointChange?: Map<string, number>) {
    if (userIdArray.length === 0) return log.info(`${infoType} user Id Array is empty, skipping user data check`)
    log.info(`Valid ${infoType} user ID array provided`)

    const currentGuild: MongoGuild = await guilds.findOne({guildId: interaction.guildId})
    const userData = currentGuild.userData

    const XPPerEnlist: number = 10
    const XPPerReject: number = 5
    const XPPerPerhaps: number = 5

    let defaultEnlistStats = {
        enlists: 0,
        rejects: 0,
        ignores: 0,
        fetchXP: 0,
        fetchStreak: 0
    }

    let defaultPredictionStats = {
        points: 1000,
        correctPredictions: 0,
        incorrectPredictions: 0
    }

    switch (infoType) {
        case UserInfo.Enlist:
            defaultEnlistStats.enlists = 1
            defaultEnlistStats.fetchXP = XPPerEnlist
            defaultEnlistStats.fetchStreak = 1
            break;
        case UserInfo.Reject:
            defaultEnlistStats.rejects = 1
            defaultEnlistStats.fetchXP = XPPerReject
            break;
        case UserInfo.Ignore:
            defaultEnlistStats.ignores = 1
            break;
        case UserInfo.Perhaps:
            defaultEnlistStats.fetchXP = XPPerPerhaps
            break;
        case UserInfo.PredictionCreate:
            defaultPredictionStats.correctPredictions = 0
            defaultPredictionStats.incorrectPredictions = 0
            break;
        case UserInfo.CorrectPrediction:
        case UserInfo.IncorrectPrediction:
        case UserInfo.ValorantProfile:
            break;
        default:
            return;
    }

    const userDataIds = new Set(userData.map(user => user.id)); // make set bc way faster lookup times

    for (const userId of userIdArray) {
        const guildMember = await interaction.guild.members.fetch(userId)

        if (!userDataIds.has(userId)) {
            log.info(`creating user data for ${guildMember.user.username}...`)
            if ([UserInfo.Enlist, UserInfo.Reject, UserInfo.Ignore, UserInfo.Perhaps].includes(infoType)) {
                userData.push({
                    username: guildMember.user.username,
                    id: userId,
                    fetchStats: defaultEnlistStats
                })
            } else if (infoType === UserInfo.ValorantProfile) {
                userData.push({
                    username: guildMember.user.username,
                    id: userId,
                    valorantProfile: {
                        username: profile.username,
                        tag: profile.tag,
                    }
                })
            } else if (infoType === UserInfo.PredictionCreate) {
                userData.push({
                    username: guildMember.user.username,
                    id: userId,
                    predictionStats: {
                        points: 1000,
                        correctPredictions: 0,
                        incorrectPredictions: 0,
                    }
                })
            }
            log.info('Done')

        } else {
            const user = userData.find(user => user.id === userId)
            const maxEnlistStreak = 5
            const bonusStreakXP = 5
            const maxPoints = 1_000_000_000
            const minPoints = 1

            switch (infoType) {
                case UserInfo.Enlist:
                    // mongo returns NaN if value does not exist (undefined)
                    if (!isNaN(user.fetchStats.enlists)) {
                        user.fetchStats.enlists++;
                        if (user.fetchStats.fetchStreak < maxEnlistStreak) {
                            user.fetchStats.fetchStreak++
                        }
                        user.fetchStats.fetchXP += XPPerEnlist + (bonusStreakXP * user.fetchStats.fetchStreak)
                        break;
                    }
                    user.fetchStats = defaultEnlistStats
                    break;
                case UserInfo.Reject:
                    if (!isNaN(user.fetchStats.rejects)) {
                        user.fetchStats.rejects++
                        user.fetchStats.fetchStreak = 0
                        user.fetchStats.fetchXP += XPPerReject
                        break;
                    }
                    user.fetchStats = defaultEnlistStats
                    break;
                case UserInfo.Ignore:
                    if (!isNaN(user.fetchStats.ignores)) {
                        user.fetchStats.ignores = 1
                        break;
                    }
                    user.fetchStats = defaultEnlistStats
                    break;
                case UserInfo.Perhaps:
                    if (!isNaN(user.fetchStats.ignores)) {
                        user.fetchStats.fetchXP += 1
                        user.fetchStats.fetchStreak = 0
                        break;
                    }
                    user.fetchStats = defaultEnlistStats
                    break;
                case UserInfo.ValorantProfile:
                    user.valorantProfile.username = profile.username
                    user.valorantProfile.tag = profile.tag
                    break;
                case UserInfo.PredictionCreate:
                    user.predictionStats.points = 1000
                    user.predictionStats.incorrectPredictions = 0
                    user.predictionStats.correctPredictions = 0
                    break;
                case UserInfo.CorrectPrediction:
                    if (!isNaN(user.predictionStats.correctPredictions)) {
                        const pointIncrease = pointChange.get(userId)
                        user.predictionStats.correctPredictions++;
                        user.predictionStats.points = Math.min(user.predictionStats.points + pointIncrease, maxPoints);
                        break;
                    }
                    user.predictionStats = defaultPredictionStats
                    break;
                case UserInfo.IncorrectPrediction:
                    if (!isNaN(user.predictionStats.incorrectPredictions)) {
                        const pointDecrease = pointChange.get(userId)
                        user.predictionStats.incorrectPredictions++
                        user.predictionStats.points = Math.max(user.predictionStats.points - pointDecrease, minPoints);
                        break;
                    }
                    user.predictionStats = defaultPredictionStats
                    break;
                default:
                    return;
            }
        }
        await currentGuild.save()
    }
}
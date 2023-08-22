import guilds from "../../schemas/guild-schema";
import log from "../../constants/logger";
import {AutocompleteInteraction, CommandInteraction, Snowflake} from "discord.js";
import {GameProfile, MongoGuild, UserInfo} from "../../myTypes";

/**
 * updates mongoDB UserData
 *
 * @param interaction
 * @param userIdArray
 * @param infoType
 * @param profile
 * @param pointChange - amount of prediction points gained or lost
 */

export default async function updateUserData(interaction: CommandInteraction | AutocompleteInteraction, userIdArray: Snowflake[], infoType: UserInfo, profile?: GameProfile, pointChange?: Map<string, number>) {
    if (userIdArray.length === 0) return log.info(`${infoType} user Id Array is empty, skipping user data check`)
    log.info(`Valid ${infoType} user ID array provided`)

    const currentGuild: MongoGuild = await guilds.findOne({guildId: interaction.guildId})
    const userData = currentGuild.userData

    const XPPerAccept: number = 10
    const XPPerReject: number = 5
    const XPPerPerhaps: number = 5
    const maxAcceptStreak = 5
    const bonusXP = 2

    const pointsPerAccept = 200
    const pointsPerReject = 100
    const pointsPerPerhaps = 100
    const maxPoints = 1_000_000_000
    const minPoints = 1

    const defaultFetchStats = {
        accepts: 0,
        rejects: 0,
        perhaps: 0,
        ignores: 0,
        fetchXP: -1, // if you enlist start at level 1 instead of skipping to level 2
        fetchStreak: 0
    }

    const defaultPredictionStats = {
        points: 1000,
        correctPredictions: 0,
        incorrectPredictions: 0
    }

    switch (infoType) {
        case UserInfo.Accept:
            defaultFetchStats.accepts = 1
            defaultFetchStats.fetchXP = XPPerAccept - 1
            defaultFetchStats.fetchStreak = 1
            break;
        case UserInfo.Reject:
            defaultFetchStats.rejects = 1
            defaultFetchStats.fetchXP = XPPerReject - 1
            break;
        case UserInfo.Perhaps:
            defaultFetchStats.perhaps = 1
            defaultFetchStats.fetchXP = XPPerPerhaps - 1
            break;
        case UserInfo.Ignore:
            defaultFetchStats.ignores = 1
            break;
        case UserInfo.CorrectPrediction:
            defaultPredictionStats.correctPredictions = 1
            break;
        case UserInfo.IncorrectPrediction:
            defaultPredictionStats.incorrectPredictions = 1
            break;
        case UserInfo.PredictionCreate:
        case UserInfo.ValorantProfile:
        case UserInfo.R6Profile:
            break;
        default:
            return;
    }

    const userDataIds = new Set(userData.map(user => user.id)); // make set bc way faster lookup times

    for (const userId of userIdArray) {
        const guildMember = await interaction.guild.members.fetch(userId)

        if (!userDataIds.has(userId)) {
            log.info(`creating user data for ${guildMember.user.username}...`)
            if ([UserInfo.Accept, UserInfo.Reject, UserInfo.Ignore, UserInfo.Perhaps].includes(infoType)) {
                userData.push({
                    username: guildMember.user.username,
                    id: userId,
                    fetchStats: defaultFetchStats
                })
            } else if (infoType === UserInfo.ValorantProfile) {
                if (!("tag" in profile)) return log.error('wrong profile type. need valorant profile')
                userData.push({
                    username: guildMember.user.username,
                    id: userId,
                    valorantProfile: {
                        username: profile.username,
                        tag: profile.tag,
                    }
                })
            } else if (infoType === UserInfo.R6Profile) {
                if (!("platform" in profile)) return log.error('wrong profile type. need r6 profile')
                userData.push({
                    username: guildMember.user.username,
                    id: userId,
                    r6Profile: {
                        username: profile.username,
                        platform: profile.platform,
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

            // make sure users who have gambled can still get points when interacting with fetch prompt (also prevents crash)
            const alternativePredictionPointEvents = [
                UserInfo.Accept,
                UserInfo.Reject,
                UserInfo.Perhaps,
            ]

            if (alternativePredictionPointEvents.includes(infoType)) {
                if (!isNaN(user.predictionStats.points)) {
                    user.predictionStats.points = defaultPredictionStats.points
                }
            }

            switch (infoType) {
                case UserInfo.Accept:
                    // mongo returns NaN if value does not exist (undefined)
                    if (!isNaN(user.fetchStats.accepts)) {
                        user.fetchStats.accepts++;
                        if (user.fetchStats.fetchStreak < maxAcceptStreak) {
                            user.fetchStats.fetchStreak++
                        }
                        user.fetchStats.fetchXP += XPPerAccept + (bonusXP * user.fetchStats.fetchStreak)
                        user.predictionStats.points = Math.max(user.predictionStats.points + pointsPerAccept, maxPoints);
                        break;
                    }
                    user.fetchStats = defaultFetchStats
                    break;
                case UserInfo.Reject:
                    if (!isNaN(user.fetchStats.rejects)) {
                        user.fetchStats.rejects++
                        user.fetchStats.fetchStreak = 0
                        user.fetchStats.fetchXP += XPPerReject
                        user.predictionStats.points = Math.max(user.predictionStats.points + pointsPerReject, maxPoints);
                        break;
                    }
                    user.fetchStats = defaultFetchStats
                    break;
                case UserInfo.Ignore:
                    if (!isNaN(user.fetchStats.ignores)) {
                        user.fetchStats.ignores = 1
                        break;
                    }
                    user.fetchStats = defaultFetchStats
                    break;
                case UserInfo.Perhaps:
                    if (!isNaN(user.fetchStats.perhaps)) {
                        user.fetchStats.fetchXP += XPPerPerhaps
                        user.fetchStats.fetchStreak = 0
                        user.predictionStats.points = Math.max(user.predictionStats.points + pointsPerPerhaps, maxPoints);
                        break;
                    }
                    user.fetchStats = defaultFetchStats
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
                case UserInfo.ValorantProfile:
                    user.valorantProfile.username = profile.username
                    if (!("tag" in profile)) return log.error('wrong profile type. need valorant profile')
                    user.valorantProfile.tag = profile.tag
                    break;
                case UserInfo.R6Profile:
                    user.r6Profile.username = profile.username
                    if (!("platform" in profile)) return log.error('wrong profile type. need r6 profile')
                    user.r6Profile.platform = profile.platform
                    break;
                default:
                    return;
            }
        }
        await currentGuild.save()
    }
}
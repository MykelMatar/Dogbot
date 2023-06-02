import Guild from "../schemas/guild-schema";
import log from "../constants/logger";
import {AutocompleteInteraction, CommandInteraction, Snowflake} from "discord.js";
import {GameProfile, IGuild, UserInfo} from "../myTypes";

/**
 * updates mongoDB UserData
 *
 * @param interaction
 * @param userIdArray
 * @param infoType
 * @param profile
 */

export async function updateUserData(interaction: CommandInteraction | AutocompleteInteraction, userIdArray: Snowflake[], infoType: UserInfo, profile?: GameProfile) {
    if (userIdArray.length === 0) return log.info(`${infoType} user Id Array is empty, skipping user data check`)
    log.info(`Valid ${infoType} user ID array provided`)

    const currentGuild: IGuild = await Guild.findOne({guildId: interaction.guildId})
    const userData = currentGuild.userData

    const XPPerEnlist: number = 10
    const XPPerReject: number = 5
    const XPPerPerhaps: number = 5

    let defaultEnlistStats = {
        enlists: 0,
        rejects: 0,
        ignores: 0,
        enlistXP: 0,
        enlistStreak: 0
    }

    switch (infoType) {
        case UserInfo.Enlist:
            defaultEnlistStats.enlists = 1
            defaultEnlistStats.enlistXP = XPPerEnlist
            defaultEnlistStats.enlistStreak = 1
            break;
        case UserInfo.Reject:
            defaultEnlistStats.rejects = 1
            defaultEnlistStats.enlistXP = XPPerReject
            break;
        case UserInfo.Ignore:
            defaultEnlistStats.ignores = 1
            break;
        case UserInfo.Perhaps:
            defaultEnlistStats.enlistXP = XPPerPerhaps
            break;
        case UserInfo.WarzoneProfile:
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
                    enlistStats: defaultEnlistStats
                })
            } else if (infoType == UserInfo.ValorantProfile) {
                if (!("tag" in profile)) return log.error('Incorrect profile type (Need Valorant Profile)')
                userData.push({
                    username: guildMember.user.username,
                    id: userId,
                    valorantProfile: {
                        username: profile.username,
                        tag: profile.tag,
                    }
                })
            } else if (infoType == UserInfo.WarzoneProfile) {
                if (!("platform" in profile)) return log.error('Incorrect profile type (Need Warzone Profile)')
                userData.push({
                    username: guildMember.user.username,
                    id: userId,
                    warzoneProfile: {
                        username: profile.username,
                        platform: profile.platform,
                    }
                })
            }
            log.info('Done')

        } else {
            const user = userData.find(user => user.id === userId)
            const maxEnlistStreak = 5
            const bonusStreakXP = 5

            switch (infoType) {
                case UserInfo.Enlist:
                    // mongo returns NaN if value does not exist (undefined)
                    if (!isNaN(user.enlistStats.enlists)) {
                        user.enlistStats.enlists++;
                        if (user.enlistStats.enlistStreak < maxEnlistStreak) {
                            user.enlistStats.enlistStreak++
                        }
                        user.enlistStats.enlistXP += XPPerEnlist + (bonusStreakXP * user.enlistStats.enlistStreak)
                        break;
                    }
                    user.enlistStats = defaultEnlistStats
                    break;
                case UserInfo.Reject:
                    if (!isNaN(user.enlistStats.rejects)) {
                        user.enlistStats.rejects++
                        user.enlistStats.enlistStreak = 0
                        user.enlistStats.enlistXP += XPPerReject
                        break;
                    }
                    user.enlistStats = defaultEnlistStats
                    break;
                case UserInfo.Ignore:
                    if (!isNaN(user.enlistStats.ignores)) {
                        user.enlistStats.ignores = 1
                        break;
                    }
                    user.enlistStats = defaultEnlistStats
                    break;
                case UserInfo.Perhaps:
                    if (!isNaN(user.enlistStats.ignores)) {
                        user.enlistStats.enlistXP += 1
                        user.enlistStats.enlistStreak = 0
                        break;
                    }
                    user.enlistStats = defaultEnlistStats
                    break;
                case UserInfo.ValorantProfile:
                    if (!("tag" in profile)) return log.error('Incorrect profile type (Need Valorant Profile)')
                    user.valorantProfile.username = profile.username
                    user.valorantProfile.tag = profile.tag
                    break;
                case UserInfo.WarzoneProfile:
                    if (!("platform" in profile)) return log.error('Incorrect profile type (Need Warzone Profile)')
                    user.warzoneProfile.username = profile.username
                    user.warzoneProfile.platform = profile.platform
                    break;
                default:
                    return;
            }
        }
        log.info('Saving changes to Mongo')
        await currentGuild.save()
    }
}
import Guild from "../schemas/guild-schema";
import log from "../logger";
import {CommandInteraction, Snowflake} from "discord.js";
import {GameProfile, IGuild, UserStats} from "../myTypes";
import {platforms} from "call-of-duty-api";

/**
 * Logic for leveling system
 *  - only Enlists grant XP (what to do about perhaps gamers that game?)
 *  - Enlist streaks grant more XP
 *  - Reject ends an enlist streak
 *  - Each level requires more xp than the last
 *      - everyone starts at level 1
 *      - level 2 requires 10 xp
 *      - every level requires an additional 10xp
 *      - Enlists give base 10xp
 *      - Enlist streak caps out at 10
 *          - Every enlist streak level grants an additional 5xp per enlist (max of 50)
 *      - no streak, lvl 50 = 500/10 = 50 enlists
 *      - with consistent streak, lvl 50 = 500-270 / 50 =  ~14 enlists (i think)
 *  - Prestige leveling after level 50
 *  - 10 prestiges then Master Prestige
 *  - Make custom symbols for each one so people get badge in the prompt
 *  - store user xp as number that only increases over time (no reset on prestige)
 *      - map xp values to levels and prestiges that get calculated when needed
 *      - OR also store lvl so that it doesnt need to be calculated every time? dec tax on system but inc usage in db
 */

/**
 * updates mongoDB UserData
 *
 * @param interaction
 * @param userIdArray
 * @param statName
 * @param profile
 */
export async function updateUserData(interaction: CommandInteraction, userIdArray: Snowflake[], statName: UserStats, profile?: GameProfile) {
    if (userIdArray.length === 0) return log.info(`${statName} user Id Array is empty, skipping user data check`)
    log.info(`Valid ${statName} user ID array provided`)

    const currentGuild: IGuild = await Guild.findOne({guildId: interaction.guildId})
    const userData = currentGuild.userData

    log.info('checking for user data...')
    if (userData.length == 0) {
        log.info(`no user data for ${interaction.guild.name}`)
        let guildMember = await interaction.guild.members.fetch(userIdArray[0])
        log.info(`creating user data for ${guildMember.user.username}...`)
        switch (statName) {
            case UserStats.tttWins:
            case UserStats.tttLosses:
                userData.push({
                    username: guildMember.user.username,
                    id: userIdArray[0],
                    tttStats: {
                        wins: statName === UserStats.tttWins ? 1 : 0,
                        losses: statName === UserStats.tttLosses ? 1 : 0
                    }
                })
                break;
            case UserStats.enlist:
            case UserStats.reject:
            case UserStats.ignore:
                const enlistStats = {
                    enlists: 0,
                    rejects: 0,
                    ignores: 0,
                    enlistXp: 0,
                    enlistStreak: 0
                };

                if (statName === UserStats.enlist) {
                    enlistStats.enlists = 1;
                    enlistStats.enlistXp = 10;
                    enlistStats.enlistStreak = 1;
                } else if (statName === UserStats.reject) {
                    enlistStats.rejects = 1;
                } else if (statName === UserStats.ignore) {
                    enlistStats.ignores = 1;
                }

                userData.push({
                    username: guildMember.user.username,
                    id: userIdArray[0],
                    enlistStats: enlistStats
                })
                break;
            case UserStats.wzProfile:
                if (!("platform" in profile)) return log.error('Incorrect profile type. Warzone Profile has the "platform" property.')
                userData.push({
                    username: guildMember.user.username,
                    id: userIdArray[0],
                    warzoneProfile: {
                        username: profile.username,
                        platform: profile?.platform,
                    }
                })
                break;
            case UserStats.valProfile:
                if (!("tag" in profile)) return log.error('Incorrect profile type. Valorant Profile has the "tag" property.')
                userData.push({
                    username: guildMember.user.username,
                    id: userIdArray[0],
                    valorantProfile: {
                        username: profile.username,
                        tag: profile?.tag,
                    }
                })
                break;
        }
        userIdArray.splice(0, 1)
        log.info('Server now has User Data')
        
        if (userIdArray.length == 0) {
            await currentGuild.save()
            return log.info(`Done!`)
        }
    }

    for (const userId of userIdArray) { // 'for of' instead of 'for each' so await can be used
        const index = userIdArray.indexOf(userId);

        let guildMember = await interaction.guild.members.fetch(userId)
        if (!(userData.some(user => user.id === userIdArray[index]))) { // if user data doesnt exist, create data
            log.info(`creating user data for ${guildMember.user.username}...`)
            let username = interaction.guild.members.cache.get(`${userIdArray[index]}`).user.username

            switch (statName) {
                case UserStats.tttWins:
                case UserStats.tttLosses:
                    if (userData[index].tttStats == null) {
                        userData.push({
                            username: username,
                            id: userIdArray[index],
                            tttStats: {
                                wins: statName === UserStats.tttWins ? 1 : 0,
                                losses: statName === UserStats.tttLosses ? 1 : 0
                            }
                        })
                    }
                    break;
                case UserStats.enlist:
                case UserStats.reject:
                case UserStats.ignore:
                    if (userData[index].enlistStats == null) {
                        userData.push({
                            username: username,
                            id: userIdArray[index],
                            enlistStats: {
                                enlists: statName === UserStats.enlist ? 1 : 0,
                                rejects: statName === UserStats.reject ? 1 : 0,
                                ignores: statName === UserStats.ignore ? 1 : 0,
                                enlistXp: 0,
                                enlistStreak: 0,
                            }
                        })
                    }
                    break;
                case UserStats.wzProfile:
                    if (!("platform" in profile)) return log.error('Incorrect profile type. Warzone Profile has the "platform" property.')
                    if (userData[index].warzoneProfile != null) return log.error(`User already has Warzone profile data`)
                    userData.push({
                        username: username,
                        id: userIdArray[index],
                        warzoneProfile: {
                            username: profile.username,
                            platform: profile.platform,
                        }
                    })

                    break;
                case UserStats.valProfile:
                    if (!("tag" in profile)) return log.error('Incorrect profile type. Valorant Profile has the "tag" property.')
                    if (userData[index].valorantProfile != null) return log.error(`User already has Valorant profile data`)
                    userData.push({
                        username: username,
                        id: userIdArray[index],
                        valorantProfile: {
                            username: profile.username,
                            tag: profile?.tag,
                        }
                    })
                    break;
            }
            log.info('Done!')
        } else {
            log.info(`Updating user data for ${guildMember.user.username} in ${interaction.guild.name}...`)
            let user = userData.find(user => user.id === userId)
            // check if the corresponding stat exists within the user data: if it doesn't exist, make it, if it exists, update it
            switch (statName) {
                case UserStats.tttWins:
                    if (Object.keys(user.tttStats).length === 0) {
                        user.tttStats.wins = 1
                        user.tttStats.losses = 0
                    } else user.tttStats.wins++;
                    break;
                case UserStats.tttLosses:
                    if (Object.keys(user.tttStats).length === 0) {
                        user.tttStats.wins = 0
                        user.tttStats.losses = 1
                    } else user.tttStats.losses++;
                    break;
                case UserStats.enlist:
                    if (Object.keys(user.enlistStats).length === 0) {
                        user.enlistStats.enlists = 1
                        user.enlistStats.rejects = 0
                        user.enlistStats.ignores = 0
                    } else user.enlistStats.enlists++;
                    break;
                case UserStats.reject:
                    if (Object.keys(user.enlistStats).length === 0) {
                        user.enlistStats.enlists = 0
                        user.enlistStats.rejects = 1
                        user.enlistStats.ignores = 0
                    } else user.enlistStats.rejects++
                    break;
                case UserStats.ignore:
                    if (Object.keys(user.enlistStats).length === 0) {
                        user.enlistStats.enlists = 0
                        user.enlistStats.rejects = 0
                        user.enlistStats.ignores = 1
                    } else user.enlistStats.ignores++
                    break;
                case UserStats.wzProfile:
                    if (!("platform" in profile)) return log.error('Incorrect profile type. Warzone Profile has the "platform" property.')
                    user.warzoneProfile.username = profile.username
                    user.warzoneProfile.platform = profile?.platform as platforms
                    break;
                case UserStats.valProfile:
                    if (!("tag" in profile)) return log.error('Incorrect profile type. Valorant Profile has the "tag" property.')
                    user.valorantProfile.username = profile.username
                    user.valorantProfile.tag = profile?.tag as string
                    break;
            }
        }
    }
    await currentGuild.save()
    log.info('Done!')
}

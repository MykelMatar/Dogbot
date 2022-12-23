import guilds from "../schemas/guild-schema";
import log from "../logger";
import {CommandInteraction} from "discord.js";
import {platforms} from "call-of-duty-api";
import {GameProfile, UserStats} from "../myTypes";

/**
 * updates mongoDB UserData
 *
 * @param interaction
 * @param userIdArray
 * @param statName
 * @param profile
 */
export async function updateUserData(interaction: CommandInteraction, userIdArray: string[], statName: UserStats, profile?: GameProfile) {
    if (userIdArray.length === 0) return log.info(`${statName} user Id Array is empty, skipping user data check`)
    log.info(`Valid ${statName} user ID array provided`)

    const currentGuild = await guilds.findOne({guildId: interaction.guildId})
    const UserData = currentGuild.UserData

    let statsArray: number[] = []; // default values if user has no data
    switch (statName) {
        case UserStats.tttWins:
            statsArray = [1, 0, 0, 0, 0];
            break;
        case UserStats.tttLosses:
            statsArray = [0, 1, 0, 0, 0];
            break;
        case UserStats.enlist:
            statsArray = [0, 0, 1, 0, 0];
            break;
        case UserStats.reject:
            statsArray = [0, 0, 0, 1, 0];
            break;
        case UserStats.ignore:
            statsArray = [0, 0, 0, 0, 1];
            break;
    }

    log.info('checking for user data...')
    if (UserData.length == 0) {
        log.info(`no user data for ${interaction.guild.name}`)
        let guildMember = await interaction.guild.members.fetch(userIdArray[0])
        log.info(`creating user data for ${guildMember.user.username}...`)
        switch (statName) {
            case UserStats.tttWins:
            case UserStats.tttLosses:
                UserData.push({
                    username: guildMember.user.username,
                    id: userIdArray[0],
                    tttStats: {
                        wins: statsArray[0],
                        losses: statsArray[1]
                    }
                })
                break;
            case UserStats.enlist:
            case UserStats.reject:
            case UserStats.ignore:
                UserData.push({
                    username: guildMember.user.username,
                    id: userIdArray[0],
                    enlistStats: {
                        enlists: statsArray[2],
                        rejects: statsArray[3],
                        ignores: statsArray[4]
                    }
                })
                break;
            case UserStats.wzProfile:
                if (!("platform" in profile)) return log.error('Incorrect profile type. Warzone Profile has the "platform" property.')
                UserData.push({
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
                UserData.push({
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
        if (!(UserData.some(user => user.id === userIdArray[index]))) { // if user data doesnt exist, create data
            log.info(`creating user data for ${guildMember.user.username}...`)
            let username = interaction.guild.members.cache.get(`${userIdArray[index]}`).user.username

            switch (statName) {
                case UserStats.tttWins:
                case UserStats.tttLosses:
                    if (UserData[index].tttStats == null) {
                        UserData.push({
                            username: username,
                            id: userIdArray[index],
                            tttStats: {
                                wins: statsArray[0],
                                losses: statsArray[1]
                            }
                        })
                    }
                    break;
                case UserStats.enlist:
                case UserStats.reject:
                case UserStats.ignore:
                    if (UserData[index].enlistStats == null) {
                        UserData.push({
                            username: username,
                            id: userIdArray[index],
                            enlistStats: {
                                enlists: statsArray[2],
                                rejects: statsArray[3],
                                ignores: statsArray[4]
                            }
                        })
                    }
                    break;
                case UserStats.wzProfile:
                    if (!("platform" in profile)) return log.error('Incorrect profile type. Warzone Profile has the "platform" property.')
                    if (UserData[index].warzoneProfile != null) return log.error(`User already has Warzone profile data`)
                    UserData.push({
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
                    if (UserData[index].valorantProfile != null) return log.error(`User already has Valorant profile data`)
                    UserData.push({
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
            let user = UserData.find(user => user.id === userId)
            // check if the corresponding stat exists within the user data: if it doesn't exist, make it, if it exists, update it
            switch (statName) {
                case UserStats.tttWins:
                    if (user.tttStats == '{}') {
                        user.tttStats.wins = 1
                        user.tttStats.losses = 0
                    } else user.tttStats.wins++;
                    break;
                case UserStats.tttLosses:
                    if (user.tttStats == '{}') {
                        user.tttStats.wins = 0
                        user.tttStats.losses = 1
                    } else user.tttStats.losses++;
                    break;
                case UserStats.enlist:
                    if (user.enlistStats == '{}') {
                        user.enlistStats.enlists = 1
                        user.enlistStats.rejects = 0
                        user.enlistStats.ignores = 0
                    } else user.enlistStats.enlists++;
                    break;
                case UserStats.reject:
                    if (user.enlistStats == '{}') {
                        user.enlistStats.enlists = 0
                        user.enlistStats.rejects = 1
                        user.enlistStats.ignores = 0
                    } else user.enlistStats.rejects++
                    break;
                case UserStats.ignore:
                    if (user.enlistStats == '{}') {
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

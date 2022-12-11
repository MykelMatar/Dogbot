import guilds from "../schemas/guild-schema";
import log from "../logger";
import {CommandInteraction} from "discord.js";
import {platforms} from "call-of-duty-api";

/**
 * updates mongoDB UserData
 * 
 * @param interaction
 * @param userIdArray
 * @param statName
 * @param profile
 */
export async function updateUserData(interaction: CommandInteraction, userIdArray: string[], statName: StatName, profile?: [string, platforms | string]) {
    if (userIdArray.length === 0) return log.info(`${statName} user Id Array is empty, skipping user data check`)
    log.info(`Valid ${statName} user ID array provided`)

    const currentGuild= await guilds.findOne({guildId: interaction.guildId})
    const UserData = currentGuild.UserData

    let statsArray: number[] = []; // statsArray Format: [tttwins, tttlosses, enlists, rejects, ignores] 
    switch (statName) { // default values for creating user data
        case StatName.tttWins:
            statsArray = [1, 0, 0, 0, 0];
            break;
        case StatName.tttLosses:
            statsArray = [0, 1, 0, 0, 0];
            break;
        case StatName.enlist:
            statsArray = [0, 0, 1, 0, 0];
            break;
        case StatName.reject:
            statsArray = [0, 0, 0, 1, 0];
            break;
        case StatName.ignore:
            statsArray = [0, 0, 0, 0, 1];
            break;
    }

    log.info('checking for user data...')
    for (const userId of userIdArray) { // 'for of' instead of 'for each' so await can be used
        const index = userIdArray.indexOf(userId);

        let guildMember = await interaction.guild.members.fetch(userId)
        if (!(UserData.some(user => user.id === userIdArray[index]))) { // if user data doesnt exist, create data
            log.info(`creating user data for ${guildMember.user.username}...`)
            let username = interaction.guild.members.cache.get(`${userIdArray[index]}`).user.username

            // check which stat needs to be added
            switch (statName) {
                case StatName.tttWins:
                case StatName.tttLosses:
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
                case StatName.enlist:
                case StatName.reject:
                case StatName.ignore:
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
                case StatName.wzProfile:
                    if (UserData[index].warzoneProfile == null) {
                        UserData.push({
                            username: username,
                            id: userIdArray[index],
                            warzoneProfile: {
                                username: profile[0],
                                platform: profile[1] as platforms,
                            }
                        })
                    }
                    break;
                case StatName.valProfile:
                    if (UserData[index].valorantProfile == null) {
                        UserData.push({
                            username: username,
                            id: userIdArray[index],
                            valorantProfile: {
                                username: profile[0],
                                tag: profile[1] as string,
                            }
                        })
                    }
                    break;
            }
            log.info('Done!')
        } else {
            log.info(`updating user data for ${guildMember.user.username} in ${interaction.guild.name}...`)
            let user = UserData.find(user => user.id === userId)
            // check if the corresponding stat exists within the user data: if it doesn't exist, make it, if it exists, update it
            switch (statName) {
                case StatName.tttWins:
                    if (user.tttStats == '{}') {
                        user.tttStats.wins = 1
                        user.tttStats.losses = 0
                    } else user.tttStats.wins++;
                    break;
                case StatName.tttLosses:
                    if (user.tttStats == '{}') {
                        user.tttStats.wins = 0
                        user.tttStats.losses = 1
                    } else user.tttStats.losses++;
                    break;
                case StatName.enlist:
                    if (user.enlistStats == '{}') {
                        user.enlistStats.enlists = 1
                        user.enlistStats.rejects = 0
                        user.enlistStats.ignores = 0
                    } else user.enlistStats.enlists++;
                    break;
                case StatName.reject:
                    if (user.enlistStats == '{}') {
                        user.enlistStats.enlists = 0
                        user.enlistStats.rejects = 1
                        user.enlistStats.ignores = 0
                    } else user.enlistStats.rejects++
                    break;
                case StatName.ignore:
                    if (user.enlistStats == '{}') {
                        user.enlistStats.enlists = 0
                        user.enlistStats.rejects = 0
                        user.enlistStats.ignores = 1
                    } else user.enlistStats.ignores++
                    break;
                case StatName.wzProfile:
                    user.warzoneProfile.username = profile[0]
                    user.warzoneProfile.platform = profile[1] as platforms
                    break;
                case StatName.valProfile:
                    user.valorantProfile.username = profile[0]
                    user.valorantProfile.tag = profile[1] as string
                    break;
            }
        }
    }
    await currentGuild.save()
    log.info('Done!')
}

export const enum StatName {
    tttWins = 'tttWins',
    tttLosses = 'tttLosses',
    enlist = 'enlist',
    reject = 'reject',
    ignore = 'ignore',
    wzProfile = 'wzProfile',
    valProfile = 'valProfile',
}
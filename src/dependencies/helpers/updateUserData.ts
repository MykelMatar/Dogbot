import guilds from "../schemas/guild-schema";
import {log} from "../logger";
import {CommandInteraction, Message} from "discord.js";

export async function updateUserData(message: CommandInteraction | Message, userIdArray: string[], statName: StatName, trStats?: [number, number, number, boolean]) {
    if (userIdArray.length === 0) return log.info(`${statName} user Id Array is empty, skipping user data check`)
    log.info(`Valid ${statName} user ID array provided`)

    const currentGuild = await guilds.findOne({guildId: message.guildId})
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
    for (const userId of userIdArray) { // for of instead of for each so await can be used
        const index = userIdArray.indexOf(userId);

        let guildMember = await message.guild.members.fetch(userId)
        if (!(UserData.some(user => user.id === userIdArray[index]))) { // if user data doesnt exist, create data
            log.info(`creating user data for ${guildMember.user.username}...`)
            let username = message.guild.members.cache.get(`${userIdArray[index]}`).user.username

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
                case StatName.trWins:
                case StatName.trLosses:
                    if (UserData[index].typingRaceStats == null) {
                        UserData.push({
                            username: username,
                            id: userIdArray[index],
                            typingRaceStats: {
                                AverageWPM: trStats[0],
                                AverageRawWPM: trStats[1],
                                AverageAccuracy: trStats[2],
                                FirstPlaceWins: trStats[3] ? 1 : 0,
                            }
                        })
                    }
                    break;
            }
            log.info('Done!')
        } else {
            log.info(`updating user data for ${guildMember.user.username} in ${message.guild.name}...`)
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
                case StatName.trWins: // fall-through (like saying trWins || trLosses)
                case StatName.trLosses:
                    if (user.typingRaceStats == '{}') {
                        user.typingRaceStats.AverageWPM = trStats[0]
                        user.typingRaceStats.AverageRawWPM = trStats[1]
                        user.typingRaceStats.AverageAccuracy = trStats[2]
                        if (statName == StatName.trWins) user.typingRaceStats.FirstPlaceWins = 1
                        else user.typingRaceStats.FirstPlaceWins = 0
                    } else {
                        user.typingRaceStats.AverageWPM = parseFloat(((user.typingRaceStats.AverageWPM + trStats[0]) / 2).toFixed(2))
                        user.typingRaceStats.AverageRawWPM = parseFloat(((user.typingRaceStats.AverageRawWPM + trStats[1]) / 2).toFixed(2))
                        user.typingRaceStats.AverageAccuracy = parseFloat(((user.typingRaceStats.AverageAccuracy + trStats[2]) / 2).toFixed(4))
                        if (statName == StatName.trWins) user.typingRaceStats.FirstPlaceWins++
                    }
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
    trWins = 'trWins',
    trLosses = 'trLosses'
}
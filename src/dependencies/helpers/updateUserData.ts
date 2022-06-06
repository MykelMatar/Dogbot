import guilds from "../schemas/guild-schema";

export async function updateUserData(message, userIdArray: string[], statName: StatName, trStats?: (number | boolean)[]) {
    if (userIdArray.length === 0) return console.log(`User Id Array is empty, skipping user data check`)
    console.log('Valid User Id Array')

    const currentGuild = await guilds.findOne({guildId: message.guildId})
    const UserData = currentGuild.UserData

    let statsArray: number[] = []; // statsArray Format: [tttwins, tttlosses, enlists, rejects] 
    switch (statName) { // default values for creating user data
        case 'tttWins':
            statsArray = [1, 0, 0, 0];
            break;
        case 'tttLosses':
            statsArray = [0, 1, 0, 0];
            break;
        case 'enlist':
            statsArray = [0, 0, 1, 0];
            break;
        case 'reject':
            statsArray = [0, 0, 0, 1];
            break;
    }

    console.log('checking for user data...')
    for (const userId of userIdArray) { // for of instead of for each so await can be used
        const index = userIdArray.indexOf(userId);

        let guildMember = await message.guild.members.fetch(userId)
        if (!(UserData.some(user => user.id === userIdArray[index]))) { // if user data doesnt exist, create data
            console.log(`creating user data for ${guildMember.user.username}...`)
            let username = message.guild.members.cache.get(`${userIdArray[index]}`).user.username

            // check which stat needs to be added
            switch (statName) {
                case 'tttWins' || 'tttLosses':
                    if (UserData.tttWins == null) {
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
                case 'enlist' || 'reject':
                    if (UserData.enlistStats == null) {
                        UserData.push({
                            username: username,
                            id: userIdArray[index],
                            enlistStats: {
                                enlists: statsArray[2],
                                rejects: statsArray[3]
                            }
                        })
                    }
                    break;
                case 'trWins' || 'trLosses':
                    if (UserData.enlistStats == null) {
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
            console.log('Done!')
        } else {
            console.log(`updating user data for ${guildMember.user.username}...`)
            let user = UserData.find(user => user.id === userId)
            console.log(user)
            // check if the corresponding stat exists within the user data: if it doesn't exist, make it, if it exists, update it
            switch (statName) {
                case 'tttWins':
                    if (user.tttStats == '{}') {
                        user.tttStats.wins = 1
                        user.tttStats.losses = 0
                    } else user.tttStats.wins++;
                    break;
                case 'tttLosses':
                    if (user.tttStats == '{}') {
                        user.tttStats.wins = 0
                        user.tttStats.losses = 1
                    } else user.tttStats.losses++;
                    break;
                case 'enlist':
                    if (user.enlistStats == '{}') {
                        user.enlistStats.enlists = 1
                        user.enlistStats.rejects = 0
                    } else user.enlistStats.enlists++;
                    break;
                case 'reject':
                    if (user.enlistStats == '{}') {
                        user.enlistStats.enlists = 0
                        user.enlistStats.rejects = 1
                    } else user.enlistStats.rejects++
                    break;
                case 'trWins': // fall-through (like saying trWins || trLosses)
                case 'trLosses':
                    console.log(user.typingRaceStats == '{}')
                    if (user.typingRaceStats == '{}') {
                        user.typingRaceStats.AverageWPM = trStats[0]
                        user.typingRaceStats.AverageRawWPM = trStats[1]
                        user.typingRaceStats.AverageAccuracy = trStats[2]
                        if (statName == 'trWins') user.typingRaceStats.FirstPlaceWins = 1
                        else user.typingRaceStats.FirstPlaceWins = 0
                    } else {
                        user.typingRaceStats.AverageWPM = parseFloat(((user.typingRaceStats.AverageWPM + trStats[0]) / 2).toFixed(2))
                        user.typingRaceStats.AverageRawWPM = parseFloat(((user.typingRaceStats.AverageRawWPM + trStats[1]) / 2).toFixed(2))
                        user.typingRaceStats.AverageAccuracy = parseFloat(((user.typingRaceStats.AverageAccuracy + trStats[2]) / 2).toFixed(4))
                        if (statName == 'trWins') user.typingRaceStats.FirstPlaceWins++
                    }
                    break;
            }
        }
    }
    await currentGuild.save()
    console.log('Done!')
}

export const enum StatName {
    tttWins = 'tttWins',
    tttLosses = 'tttLosses',
    enlist = 'enlist',
    reject = 'reject',
    trWins = 'trWins',
    trLosses = 'trLosses'
}
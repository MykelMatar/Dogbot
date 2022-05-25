import guilds from "../schemas/guild-schema";

export async function updateUserData(message, userIdArray: number[], statName: StatName) {
    if (userIdArray.length === 0) return console.log(`User Id Array is empty, skipping user data check`)
    console.log('Valid User Id Array')

    const currentGuild = await guilds.findOne({guildId: message.guildId})
    const UserData = currentGuild.UserData

    let statsArray = []; // statsArray Format: [tttwins, tttlosses, enlists, rejects] type: integers
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
    for (const userId of userIdArray) { // for of instead of for each so await can be used inside
        const index = userIdArray.indexOf(userId);

        let guildMember = await message.guild.members.fetch(userId)
        if (!(UserData.some(user => user.id === userIdArray[index]))) { // if user data doesnt exist, create data
            console.log(`creating user data for ${guildMember.user.username}...`)
            let username = message.guild.members.cache.get(`${userIdArray[index]}`).user.username
            UserData.push({
                username: username,
                id: userIdArray[index],
                tttStats: {
                    wins: statsArray[0],
                    losses: statsArray[1]
                },
                enlistStats: {
                    enlists: statsArray[2],
                    rejects: statsArray[3]
                }
            })
            console.log('Done!')
        } else { // if it does exist, update it
            console.log(`updating user data for ${guildMember.user.username}...`)
            let user = UserData.findIndex(user => user.id === userId)
            switch (statName) { // update values for selected stat
                case 'tttWins':
                    UserData[user].tttStats.wins++;
                    break;
                case 'tttLosses':
                    UserData[user].tttStats.losses++;
                    break;
                case 'enlist':
                    UserData[user].enlistStats.enlists++;
                    break;
                case 'reject':
                    UserData[user].enlistStats.rejects++;
                    break;
            }
            console.log('Done!')
        }
    }
    await currentGuild.save()
}

export const enum StatName {
    tttWins = 'tttWins',
    tttLosses = 'tttLosses',
    enlist = 'enlist',
    reject = 'reject'
}
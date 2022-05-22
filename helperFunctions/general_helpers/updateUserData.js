const guilds = require("../../schemas/guild-schema");

/**
 * refreshes the "Menu Options" in data.JSON and creates a variable-size discord drowpdown menu
 * @param  message
 * @param {array} userIdArray
 * @param {string} statName
 */
async function updateUserData(message, userIdArray, statName) {
    const currentGuild = await guilds.findOne({guildId: message.guildId})
    const UserData = currentGuild.UserData
    const statNames = ['enlist', 'reject', 'tttWins', 'tttLosses']
    if (!(statNames.includes(statName))) return console.error('invalid stat name for function "updateUserData"')

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
    
    userIdArray.forEach((userIds, index) => {
        console.log('checking for user data...')
        console.log(UserData.some(user => user.id === userIdArray[index]))
        console.log({UserData, userIdArray})
        if (!(UserData.some(user => user.id === userIdArray[index]))) { // if user data doesnt exist, create data
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
        } else { // if it does exist, update it
            userIdArray.forEach((userIds, index) => {
                console.log('updating stats')
                console.log({UserData, userIdArray})
                if (userIdArray[index] === UserData[index].id) {
                    switch (statName) { // update values for selected stat
                        case 'tttWins':
                            UserData[index].tttStats.wins++;
                            break;
                        case 'tttLosses':
                            UserData[index].tttStats.losses++;
                            break;
                        case 'enlist':
                            UserData[index].enlistStats.enlists++;
                            break;
                        case 'reject':
                            UserData[index].enlistStats.rejects++;
                            break;
                    }
                }
            });
        }
    });
    await currentGuild.save()
}

module.exports = updateUserData
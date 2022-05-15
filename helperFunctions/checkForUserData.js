const guilds = require("../schemas/guild-schema");

async function checkForUserData(collected, message) {
    const currentGuild = await guilds.find({guildId: message.guildId})
    const UserData = currentGuild[0].UserData
    
    UserData.forEach((user, index) => {
        console.log(collected.includes(user.id))
        if (collected.includes(user.id)) { // check if user data exists, if not add user data, else do nothing
            console.log(collected[index].user.id, user.id)
        }
    })
}

module.exports = checkForUserData
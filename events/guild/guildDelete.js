const guilds = require("../../schemas/guild-schema");

module.exports = async function(client, guild) {
    console.log(`dogbot has left ${guild.name}`);
    
    // delete user data from mongo
    console.log('removing server data...')
    guilds.findOne({guildId: guild.id})
        .deleteOne()
        .catch(err => console.log(err))
    console.log('done!')
}
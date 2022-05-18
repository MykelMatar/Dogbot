const guilds = require("../../schemas/guild-schema");

module.exports = async function(client, guildMember) {
    console.log(`${guildMember.user.username} has left the server`);
    
    // delete user data from mongo
    guilds.findOneAndUpdate(
        {guildId: guildMember.guild.id},
        {$pull: { UserData: {id: guildMember.user.id}}}
    ).catch(err => console.log(err))
}
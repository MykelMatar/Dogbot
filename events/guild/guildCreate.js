const guilds = require('../../schemas/guild-schema')

module.exports = async function(client, guild) {
    console.log(`Dogbot added to ${guild.name}\nCreating database entry...`);
    
    let guildName = guild.name.replace(/\s+/g, ""); //removes whitespace from string
    
    await guilds.create({
        guild: guildName,
        guildId: guild.id,
        ServerData: {
            welcomeChannel: null,
            roles: {
                autoenlist: null,
                default: null
            }
        },
        UserData: {},
        MCServerData: {
            serverList: {},
            selectedServer: {
                name: null,
                ip: null
            }
        }
    })
    console.log('Done!')
}
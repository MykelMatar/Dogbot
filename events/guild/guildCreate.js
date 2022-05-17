const guilds = require('../../schemas/guild-schema')

module.exports = async function (client, guild) {
    console.log(`Dogbot added to ${guild.name}`);

    const guildName = guild.name.replace(/\s+/g, ""); //removes whitespace from string
    const existingGuild = await guilds.findOne({guildId: guild.id})
    if (existingGuild !== null) return

    console.log('Creating database entry...')
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
        UserData: [],
        MCServerData: {
            serverList: [],
            selectedServer: {
                name: null,
                ip: null
            }
        }
    })
    console.log('Done!')
}
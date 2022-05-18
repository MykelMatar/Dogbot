const guilds = require('../../schemas/guild-schema')


module.exports = async function(client, guildMember) {
    console.log(`${guildMember.user.username} has joined the server`);
    
    let currentGuild = await guilds.findOne({guildId: guildMember.guild.id})
    
    let welcomeChannel = currentGuild.ServerData.welcomeChannel
    let defaultRole =  currentGuild.ServerData.roles.default;
    let channel = guildMember.guild.channels.cache.get(welcomeChannel)

    // check for valid welcomeChannel, defaultRole
    if (welcomeChannel == null) return channel.send('no welcome channel, use set-welcome-channel');
    if (defaultRole == null) return channel.send('no default role, use set-welcome-channel');
    
    // check if Dogbot has a high enough role to change user perms
    if (guildMember.manageable) {
        await guildMember.roles.add(`${defaultRole}`, 'default role for new members')
            .catch(error => {
                console.log(error)
                channel.send('Could not give default role. Make sure the "Dogbot" role is high up in the role hierarchy. ')
            })
    }
    else channel.send('Could not give default role. Make sure the "Dogbot" role is high up in the role hierarchy. ')
}
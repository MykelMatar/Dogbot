const data = require('../../data.json');
const fs = require('fs'); 

module.exports = async function(client, guildMember) {
    console.log(`${guildMember.user.username} has joined the server`);
    let guildName = guildMember.guild.name.replace(/\s+/g, "");
    let welcomeChannel = data.Guilds[guildName].ServerData.welcomeChannel;
    let defaultRole =  data.Guilds[guildName].ServerData['roles'].default;
    let channel = guildMember.guild.channels.cache.get(welcomeChannel)

    // check for valid welcomeChannel, defaultRole, and if Dogbot has a high enough role to change user perms
    if (welcomeChannel == null) return channel.send('no welcome channel, use set-welcome-channel');
    if (defaultRole == null) return channel.send('no default role, use set-welcome-channel');
    if (!guildMember.manageable) return channel.send('Cannot give user roles. Make sure Dogbot has a high role. ')

    guildMember.roles.add(`${defaultRole}`, 'default role for new members');
}
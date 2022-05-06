const data = require('../../data.json');
const fs = require('fs'); 

module.exports = async function(client, guild) {
    console.log(`${guild.member} has joined the server`);
    let defaultRole =  data.Guilds[guildName].ServerData['roles'].default;
    console.log(defaultRole);
    // let defaultRole = data;
    console.log(data);
    //guild.member.add()
}
const { clearInterval } = require('timers');
const data = require('../../data.json');
const refreshServerStatus = require('../../helperFunctions/refreshServerStatus');
const writeToJson = require('../../helperFunctions/writeToJson');
const unpinEmbed = require('../../helperFunctions/unpinEmbed');






module.exports = (client, message) => {
    const PREFIX = '!';
    const args = message.content.slice(PREFIX.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    const command = client.commands.get(cmd);
    let guildName = message.guild.name.replace(/\s+/g, "");
    
    // MC Embed Handling
    if (message.embeds[0] && message.embeds[0].title == data.Guilds[guildName].MCData.selectedServer["title"]) {
        unpinEmbed(message, data.Guilds[guildName].Embeds.MCEmbedId);   // unpin old embed
        data.Guilds[guildName].Embeds.MCEmbedId = message.id;           // push new Embed Id
        writeToJson(data);

        message.pin();
        
        clearInterval(refresh); 
        var refresh = setInterval(refreshServerStatus, 30000, message, guildName); // 300000
    }

    if(message.system) {
        message.delete();
    }
    
    // command execution
    // *unless description states otherwise, commands that end with mc require admin perms
    if(!message.content.startsWith(PREFIX))  return; 
    
    if(command) command.execute(client, message, args, guildName);

}


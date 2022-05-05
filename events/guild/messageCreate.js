const data = require('../../data.json');
const preventInteractionCollision = require('../../helperFunctions/preventInteractionCollision');
const writeToJson = require('../../helperFunctions/writeToJson');
const unpinEmbed = require('../../helperFunctions/unpinEmbed');
const autoDetectRole = require('../../helperFunctions/autoDetectRole');


module.exports = async (client, message,) => {
    const PREFIX = '!';
    const args = message.content.slice(PREFIX.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    const command = client.commands.get(cmd);
    let guildName = message.guild.name.replace(/\s+/g, "");

    // detect role for autoenlist
    autoDetectRole(client, message, guildName);
    
    // command execution (deprecated)
    // *unless description states otherwise, commands that end with mc require admin perms
    // if (!message.content.startsWith(PREFIX)) return;

    // if (command) command.execute(client, message, args, guildName);
}


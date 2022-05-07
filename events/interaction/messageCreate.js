const autoDetectRole = require('../../helperFunctions/autoDetectRole');

var requireDir = require('require-dir');
var dir = requireDir('../../commands', { recurse: true });


module.exports = async (client, message,) => {
    let guildName = message.guild.name.replace(/\s+/g, "");
    
    // detect role for autoenlist
    autoDetectRole(client, message, guildName);
}


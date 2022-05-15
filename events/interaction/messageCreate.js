const autoDetectRole = require('../../helperFunctions/autoDetectRole');


module.exports = async (client, message,) => {
    let guildName = message.guild.name.replace(/\s+/g, "");
    
    // detect role for autoenlist
    await autoDetectRole(client, message, guildName);
}


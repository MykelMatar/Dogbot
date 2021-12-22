const config = require('d:/Github/Dogbot/config.json'); // change for your PC path
const data = require('d:/Github/Dogbot/data.json');

module.exports = (client, Discord, message) => {
    const PREFIX = '!';
    if(!message.content.startsWith(PREFIX)) return;
    
    let guildname = message.guild.name.replace(/\s+/g, "");
    let embedID = data.Guilds[guildname].EmbedData["id"];
    const args = message.content.slice(PREFIX.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd);

    if(command) command.execute(client, message, args, Discord);
}
const data = require('/Users/Michael/Documents/GitHub/Dogbot/data.json'); 

module.exports = (client, message) => {
    const PREFIX = '!';
    if(!message.content.startsWith(PREFIX)) return;
    
    let guildName = message.guild.name.replace(/\s+/g, "");
    const args = message.content.slice(PREFIX.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd);

    if (message.embeds[0] && message.embeds[0].title == 'Gamer Time') {
        data.Guilds[guildname].Embeds.GTEmbedData = message.id;
        writeToJson(data);
        runGTReactionCollector(message, guildname); // run reaction collector
    }
    if (message.embeds[0] && message.embeds[0].title == data.Guilds[guildName].Embeds.MCEmbedData) {
        clearInterval(refresh);  
        data.Guilds[guildname].Embeds.MCEmbedData = message.id;
        writeToJson(data);
        var refresh = setInterval(refreshStatus, 10000, message, guildname); // 300000
    }

    if(command) command.execute(client, message, args, guildName);
    command.execute()

}

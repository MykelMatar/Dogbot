const { MessageEmbed } = require('discord.js');
const data = require('/Users/Michael/Documents/GitHub/Dogbot/data.json'); 
const util = require('minecraft-server-util');
const { clearInterval } = require('timers');
const fs = require('fs');
const changemc = require('../../commands/changemc');
let tmpStatus = 0;
let status = 0;


module.exports = (client, message) => {
    const PREFIX = '!';
    const args = message.content.slice(PREFIX.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    const command = client.commands.get(cmd);
    let guildName = message.guild.name.replace(/\s+/g, "");
    
    // MC Embed Handling
    if (message.embeds[0] && message.embeds[0].title == data.Guilds[guildName].MCData.selectedServer["title"]) {
        unpinEmbed(message, data.Guilds[guildName].Embeds.MCEmbedId);   // remove old embed
        data.Guilds[guildName].Embeds.MCEmbedId = message.id;           // push new Embed Id
        writeToJson(data);

        message.pin();
        
        clearInterval(refresh); 
        var refresh = setInterval(refreshStatus, 30000, message, guildName); // 300000
    }

    // Gamer Receptionist Embed Handling
    if (message.embeds[0] && message.embeds[0].title == 'Gamer Time') {
        unpinEmbed(message, data.Guilds[guildName].Embeds.MCEmbedId);   // remove old embed
        data.Guilds[guildName].Embeds.GTEmbedData = message.id;
        writeToJson(data);
        runGTReactionCollector(message, guildname); // run reaction collector
    }

    if(message.system) {
        message.delete();
    }
    
    // command execution
    // *unless description states otherwise, commands that end with mc require admin perms
    if(!message.content.startsWith(PREFIX))  return; 

    if(command) command.execute(client, message, args, guildName);

}




/**
 * Refreshes mc server embed
 * @param  {string} message
 * @param  {string} guildName
 */
async function refreshStatus(message, guildName) {
    if (message.author.bot) {
        let MCEmbedId = data.Guilds[guildName].Embeds.MCEmbedId;
        let MCServerIP = JSON.stringify(data.Guilds[guildName].MCData.selectedServer["IP"]).replace(/[""]/g, '')  
        let title = JSON.stringify(data.Guilds[guildName].MCData.selectedServer["title"]).replace(/[""]/g, '')  

    util.status(MCServerIP)
    .then(async response => {
        status = 1
        if (tmpStatus == 1 && status == 1) { // if server status hasnt changed, update player count
            const recievedEmbed = await (await message.channel.messages.fetch(MCEmbedId)).embeds[0];
            const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed
            newEmbed.setTitle(title)
            newEmbed.fields[3] = { name: 'Online Players', value: "> " + response.players.online.toString() };

            message.edit({ embeds: [newEmbed] });
            console.log('refreshed player count')
        }
        if (tmpStatus == 0 && status == 1) { // if server goes online
  
            const recievedEmbed = await (await message.channel.messages.fetch(MCEmbedId)).embeds[0];
            const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed
            newEmbed.setTitle(title)
            newEmbed.fields[0] = []
            newEmbed .fields[1] = { name: 'Server IP',      value: "> " + MCServerIP}
            newEmbed .fields[2] = { name: 'Modpack',        value: "> " + response.motd.clean.toString()}
            newEmbed .fields[3] = { name: 'Version',        value: "> " + response.version.name.toString()}
            newEmbed .fields[4] = { name: 'Online Players', value: "> " + response.players.online.toString()}
            newEmbed .setFooter("Server Online");

            message.edit({ embeds: [newEmbed] });
            console.log('refreshed server status')
        }
        })
        .catch(async (error) => {
            console.error("Server Offline")
            status = 0;

            const recievedEmbed = await (await message.channel.messages.fetch(MCEmbedId)).embeds[0];
            const newEmbed = new MessageEmbed(recievedEmbed)
            newEmbed.setTitle(title)
            newEmbed.fields[0] = { name: "Server Offline", value: "all good" }
            newEmbed.fields[1] = []
            newEmbed.fields[2] = []
            newEmbed .fields[3] = []
            newEmbed.fields[4] = []
            newEmbed.setFooter('');

            message.edit({ embeds: [newEmbed] });
            console.log('refreshed server status')
        });
        tmpStatus = status;
  
    }
}





/**
 ** Reaction Collector for gt embed
 * @param  {string} message
 * @param  {string} guildName
 */
function runGTReactionCollector(message, guildName) {
    if (message.author.bot && message.embeds[0].title == "Gamer Time") {
       // let timer =
        //    parseInt(data.Guilds[guildName].EmbedData.Fields["Timer"]); //retrieves timer from json
        let time = data.Guilds[guildName].EmbedData.Fields["Time"]; //retrieves embed time parameter from json file
        let game = data.Guilds[guildName].EmbedData.Fields["Game"]; //retrieves embed game parameter from json file
        var gamer = []; //declares gamer array to be used throughout this entire scope

        //retrieves emoji data for reaction
        let emoji1Id = data.Guilds[guildName].EmojiData["0"];
        let emoji2Id = data.Guilds[guildName].EmojiData["1"];
        let emoji3Id = data.Guilds[guildName].EmojiData["2"];
        message.react(emoji1Id); //reacts to embed with emoji
        message.react(emoji2Id);
        message.react(emoji3Id);


        //filter to ensure no other reactions are counted
        const filter = (reaction, user) => {
            if (user.id != client.user.id) {
                if (reaction.emoji.id == null) {
                    return reaction.emoji.name;
                } else {
                    return reaction.emoji.id;
                }
            }
        };


        //collector creation
        const collector = message.createReactionCollector(filter, { time: 10000, dispose: true });
        var gamertags1 = ['-'];
        var gamertags2 = ['-'];
        var gamertags3 = ['-'];

        //start of collection
        collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
            gamer.push(user.id);



            //edit embed to sort people into respective categories
            const recievedEmbed = message.embeds[0];
            const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed


            //when someone reacts, add them to the corresponding reaction array and remove them from the other two
            if (reaction.emoji == getEmoji1(message, guildName) || reaction.emoji.name == getEmoji1(message, guildName)) {
                if (!gamertags1.includes("> " + user.username)) { gamertags1.push("> " + user.username) } //checks if user is already in array
                if (gamertags2.includes("> " + user.username)) { gamertags2.splice(gamertags2.indexOf("> " + user.username), 1) } //removes user from other 2 arrays to ensure there are no duplicates
                if (gamertags3.includes("> " + user.username)) { gamertags3.splice(gamertags3.indexOf("> " + user.username), 1) }
                if (!(gamertags2.includes('-')) && gamertags2.length == 0) { gamertags2.push('-') } //makes sure array 2 is never empty
                if (!(gamertags3.includes('-')) && gamertags3.length == 0) { gamertags3.push('-') } //makes sure array 3 is never empty
                if (gamertags1.length > 1 && gamertags1.includes('-')) {  //removes extra dash if a user is in the array
                    gamertags1.splice(gamertags1.indexOf('-'), 1)
                }
            }
            if (reaction.emoji == getEmoji2(message, guildName) || reaction.emoji.name == getEmoji2(message, guildName)) {
                if (!gamertags2.includes("> " + user.username)) { gamertags2.push("> " + user.username) } //checks if user is already in array
                if (gamertags1.includes("> " + user.username)) { gamertags1.splice(gamertags1.indexOf("> " + user.username), 1) } //removes user from other 2 arrays to ensure there are no duplicates
                if (gamertags3.includes("> " + user.username)) { gamertags3.splice(gamertags3.indexOf("> " + user.username), 1) }
                if (!(gamertags1.includes('-')) && gamertags1.length == 0) { gamertags1.push('-') } //makes sure array 1 is never empty
                if (!(gamertags3.includes('-')) && gamertags3.length == 0) { gamertags3.push('-') } //makes sure array 3 is never empty
                if (gamertags2.length > 1 && gamertags2.includes('-')) {  //removes extra dash if a user is in the array
                    gamertags2.splice(gamertags2.indexOf('-'), 1)
                }
            }
            if (reaction.emoji == getEmoji3(message, guildName) || reaction.emoji.name == getEmoji3(message, guildName)) {
                if (!gamertags3.includes("> " + user.username)) { gamertags3.push("> " + user.username) } //checks if user is already in array
                if (gamertags2.includes("> " + user.username)) { gamertags2.splice(gamertags2.indexOf("> " + user.username), 1) } //removes user from other 2 arrays to ensure there are no duplicates
                if (gamertags1.includes("> " + user.username)) { gamertags1.splice(gamertags1.indexOf("> " + user.username), 1) }
                if (!(gamertags1.includes('-')) && gamertags1.length == 0) { gamertags1.push('-') } //makes sure array 1 is never empty
                if (!(gamertags2.includes('-')) && gamertags2.length == 0) { gamertags2.push('-') } //makes sure array 2 is never empty
                if (gamertags3.length > 1 && gamertags3.includes('-')) { //removes extra dash if a user is in the array
                    gamertags3.splice(gamertags3.indexOf('-'), 1)
                }
            }
            newEmbed.fields[2] = { name: printEmoji1(message, guildName) + " Forsureforsure", value: gamertags1, inline: true };
            newEmbed.fields[3] = { name: printEmoji2(message, guildName) + " mayhaps", value: gamertags2, inline: true };
            newEmbed.fields[4] = { name: printEmoji3(message, guildName) + " no", value: gamertags3, inline: true };
            reaction.users.remove(user);
            message.edit({ embeds: [Embed] });
        });

        //deletes user from collection when reaction is removed
        collector.on('remove', (reaction, user) => {
            console.log('removed')
        });

        //ends collector
        collector.on('end', (collected) => {
            message.pin();
            data.Guilds[guildName].Embed.GTEmbedData["id"] = message.id;
            writeToJson(data);
            //setJsonData(data);
        });
    }
}




async function unpinEmbed(message, embedId) {
    if (embedId != null) {
        (await message.channel.messages.fetch(embedId)).unpin();
    }
}

  function writeToJson(data) {
    fs.writeFile('./data.json', JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}
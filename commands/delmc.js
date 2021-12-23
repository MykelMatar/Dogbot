const {} = require('discord.js');
const data = require('../data.json');
const fs = require('fs');







module.exports = {
    name: 'delmc', 
    description: 'removes server from server list', 
    async execute(client, message, args, guildName){
        let filter = m => m.author.id === message.author.id
        message.reply("Enter The Name of the Server You Want To Remove.", { fetchReply: true })
        .then(() => {
            message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
            .then(collected => {
                let name = collected.first().content //.replace(/\s+/g, "");
                console.log(name);
                if (Object.keys(data.Guilds[guildName].MCData.serverList).includes(name)){
                    delete data.Guilds[guildName].MCData.serverList[name];
                    
                    writeToJson(data);
                    message.reply("Server Sucessfully Removed")
                }
                else message.reply("Invalid server name. Use !listmc to check list of registered servers")
            })
            .catch((error) => {
                message.reply('Request timed out. Please try again.')
            })
        })
        .catch(collected => {
            console.log('Error');
            message.reply('Request timed out. Please try again.')
        })
    }
}



//writes to data.json
function writeToJson(data) {
    fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
      if (err) throw err;
    });
  }
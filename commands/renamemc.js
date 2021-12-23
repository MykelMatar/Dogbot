const {  } = require('discord.js');
const data = require('../data.json');
const fs = require('fs');







module.exports = {
    name: 'renamemc', 
    description: 'renames mc server', 
    async execute(client, message, args, guildName){
        let filter = m => m.author.id === message.author.id
        message.reply("Enter the name of the server you want to change.", { fetchReply: true })
        .then(() => {
            message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
            .then(collected => {
                let name = collected.first().content //.replace(/\s+/g, "");
                console.log(name);
                if (Object.keys(data.Guilds[guildName].MCData.serverList).includes(name)){

                    message.reply("Enter the new name of your server.", { fetchReply: true })
                    .then(() => {
                        message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                        .then(collected => {
                            let newName = collected.first().content //.replace(/\s+/g, "");
                            let IP = JSON.stringify(data.Guilds[guildName].MCData.serverList[name]).replace(/[""]/g, '');

                            data.Guilds[guildName].MCData.serverList[newName] = IP;
                            delete data.Guilds[guildName].MCData.serverList[name];
                            writeToJson(data)

                            message.reply("Server renamed sucessfully")
                        })
                        .catch(collected => {
                            message.reply('Error naming server. Please try again.')
                        });
                    });
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



function writeToJson(data) {
    fs.writeFile('./data.json', JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}
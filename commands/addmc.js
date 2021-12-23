const {} = require('discord.js');
const util = require('minecraft-server-util'); 
const data = require('../data.json');
const fs = require('fs');






module.exports = {
    name: 'addmc',
    description: 'Adds a new IP to the server list', 
    async execute(client, message, args, guildName) {
        let serverListSize = Object.values(data.Guilds[guildName].MCData.serverList).length 

        if(serverListSize == 10) {
            message.reply('Max number of servers reached. Remove a server to add a new one (Limit of 10).')
            return;
        }

       
        let filter = m => m.author.id === message.author.id

        message.reply("Enter your Server IP. Make sure your server is currently online", { fetchReply: true })
        .then(() => {
            message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
            .then(collected => {
                let IP = collected.first().content;
                console.log(IP);
                if (Object.values(data.Guilds[guildName].MCData.serverList).includes(IP)) // check if IP already exists before continuing
                {
                    message.reply("Server already aegistered, double check the IP or use **!renamemc** to change the name")
                    console.log("Duplicate IP Detected");
                    return;
                } else {
                    util.status(IP)
                    .then((response) => {
                        message.reply("Valid server IP detected. Please enter a name for your server", {fetchReply: true})
                        message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                        .then(collected => {
                            let name = collected.first().content //.replace(/\s+/g, "");
                            console.log(name);

                            if (JSON.stringify(data.Guilds[guildName].MCData.serverList) == '{}') {
                                data.Guilds[guildName].MCData.selectedServer["IP"] = IP;    // use first input as default
                                data.Guilds[guildName].MCData.selectedServer["title"] = name;
                            }
                            data.Guilds[guildName].MCData.serverList[name] = IP;
                            writeToJson(data);

                            message.reply("Server added sucessfully")
                        })
                        .catch(collected => {
                            message.reply('Error naming server. Please try again.')
                        });
                    })
                    .catch((error) => {
                        message.reply('Could not retrieve server status. Double check IP and make sure server is online.')
                    })
                }
            })
            .catch(collected => {
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
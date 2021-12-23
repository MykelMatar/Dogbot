const {} = require('discord.js');
const util = require('minecraft-server-util'); 
const data = require('../data.json');
const fs = require('fs');


module.exports = {
    name: 'addmc',
    description: 'Adds a new IP to the server list', 
    async execute(client, message, args, guildName) {
        let serverListSize = Object.values(data.Guilds[guildName].MCData.serverList).length 
        if(serverListSize > 10) message.reply('Max number of servers reached. Remove a server to add a new one (Limit of 10).')

        let filter = m => m.author.id === message.author.id

        message.reply("Enter your Server IP. Make sure your server is currently online", { fetchReply: true })
        .then(() => {
            message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
            .then(collected => {
                let IP = collected.first().content;
                console.log(IP);
                if (Object.values(data.Guilds[guildName].MCData.serverList).includes(IP)) // check if IP already exists before continuing
                {
                    message.reply("Server Already Registered, Double Check the IP or Use **!renamemc** to Change the Name")
                    console.log("Duplicate IP Detected");
                    return;
                } else {
                    util.status(IP)
                    .then((response) => {
                        message.reply("Valid Server Detected. Please Enter A Name for Your Server", {fetchReply: true})
                        message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                        .then(collected => {
                            let name = collected.first().content //.replace(/\s+/g, "");
                            console.log(name);

                            if (JSON.stringify(data.Guilds[guildName].MCData.serverList) == '{}') data.Guilds[guildName].MCData.selectedServer = IP;    // use first input as default
                            data.Guilds[guildName].MCData.serverList[name] = IP;
                            writeToJson(data);

                            message.reply("Server Sucessfully Added")
                        })
                        .catch(collected => {
                            console.log('Timed Out');
                            message.reply('Timed Out. Please Try Again.')
                        });
                    })
                    .catch((error) => {
                        message.reply('Could not retrieve server status. Double Check IP and make sure Server is online.')
                    })
                }
            })
            .catch(collected => {
                console.log('Timed Out');
                message.reply('Timed Out. Please Try Again.')
            })
        })
        .catch(collected => {
            console.log('Error');
            message.reply('Timed Out. Please Try Again.')
        })
    }
}




//writes to data.json
function writeToJson(data) {
    fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}
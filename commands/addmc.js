const { MessageEmbed, MessageCollector } = require('discord.js');
const util = require('minecraft-server-util'); 
const data = require('../data.json');
const fs = require('fs');


module.exports = {
    name: 'addmc',
    description: 'Adds a new IP to the server list', 
    async execute(client, message, args, guildName){
        // let name = args[0];
        // let IP = args[1];
        // if(!args[0]) message.reply('Please input a server name');
        // if(!args[1]) message.reply('Please input a server IP. ');
        // data.Guilds[guildName].MCData.serverList[name] = IP;
        // writeToJson(data);
        let filter = m => m.author.id === message.author.id

        message.reply("Enter your Server IP. Make sure your server is currently online", { fetchReply: true })
        .then(() => {
            message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                .then(collected => {
                    let IP = collected.first().content;
                    console.log(IP);
                    util.status(IP)
                    .then((response) => {
                        message.reply("Valid Server Detected", {fetchReply: true})
                        .then(() => {
                            message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                            .then(collected => {
                                    let name = collected.first().content;
                             })
                             .catch(collected => {
                                console.log('Timed Out');
                            });
                    })
                    .catch((error) => {
                        message.reply('Could not retrieve server status. Make sure IP is valid and Server is online.')

                    });
                })
        .catch(collected => {
            console.log('Timed Out');
        });
        }
    }


function collectResponse(message, guildname){
    const collector = message.channel.createMessageCollector({ filter, time: 15000 });

collector.on('collect', m => {
	console.log(`Collected ${m.content}`);
});

collector.on('end', collected => {
	console.log(`Collected ${collected.size} items`);
});
}



//writes to data.json
function writeToJson(data) {
    fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}
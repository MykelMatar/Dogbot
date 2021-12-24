const { MessageEmbed, MessageActionRow, MessageSelectMenu} = require('discord.js');
const util = require('minecraft-server-util');
const data = require('../data.json');
const fs = require('fs');
let tmpStatus = 0;
let status = 0;
let cmdStatus = 0;



module.exports = {
    name: 'changemc', 
    description: "Changes Server that is Being Tracked. Accessible via 'mc' or 'listmc' buttons, or by calling command.", 
    async execute(client, message, args, guildName){
        console.log('changemc detected');
        
        // prevent multiple instances from running
        if (cmdStatus == 1) {
            message.reply('changemc command already running.')
            return;
        }
        cmdStatus = 1; 

        let serverListSize = Object.values(data.Guilds[guildName].MCData.serverList).length 

        if (serverListSize == 0) {
            message.reply('No Registered Servers, use !addmc or !listmc to add servers.')
            return;
        }
        else if (serverListSize == 1) {
            message.reply('Only 1 Registered Server, use !addmc or !listmc to add more servers.')
            return;
        }

        var options = [];
        options = await generateOptions(guildName, serverListSize);
        let option = options[0];
        let label = options[1];
        let value = options[2];
        let description = options[3]

        console.log(option);
        // generate select menu
        row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('selection')
                .setPlaceholder('Nothing selected')
                .addOptions(option),
        );

        let sent = await message.reply({ content: 'Select a Different Server to Check', ephemeral: true, components: [row] });

        const filter = i =>  i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({filter, componentType: 'SELECT_MENU', max: 1, time: 15000 });
        const command = client.commands.get('mc');

        collector.on('collect', async i => {
            var selection = i.values[0]
            for (let i = 0; i < serverListSize; i++) {
                if(selection == `selection${i}`){
                    var newTitle = label[i];
                    var newIP = description[i];
                    data.Guilds[guildName].MCData.selectedServer["title"] = newTitle;
                    data.Guilds[guildName].MCData.selectedServer["IP"] = newIP;
                    writeToJson(data);
                }  
            }

            if (i.customId === "selection") {
                let MCEmbedId = data.Guilds[guildName].Embeds.MCEmbedId;
                const msg = await (await message.channel.messages.fetch(MCEmbedId));
                refreshStatus(msg, guildName);  // refresh embed immediately
                
                await i.update({ content: 'Server Updated', components: []});
            }
        });
        
        collector.on('end', async collected => {
            console.log(`Collected ${collected.size} items`)
            if (collected.size == 1) await sent.edit({ content: 'Server Updated', ephemeral: true, components: [] })
            else await sent.edit({ content: 'Request Timeout', ephemeral: true, components: [] })
        });

    cmdStatus = 0;
    }
}



/**
 * refreshes the "Menu Options" in data.JSON and creates a drowpdown menu
 * @param  {string} guildName
 * @param  {int} listSize
 */
async function generateOptions(guildName, listSize) {
    var option = [], label = [], value = [], description = [];
    // delete all entries (max of 10)
    console.log('deleting entries');
    for (let i = 0; i < 9; i++) {      
        delete data.Guilds[guildName].MenuOptions[i];
        writeToJson(data);
    }
    
    // create and push new entries
    console.log('creating new entries');
    for (let i = 0; i < listSize; i++) {    
        var newJson = {
            label : Object.keys(data.Guilds[guildName].MCData.serverList)[i],
            description : Object.values(data.Guilds[guildName].MCData.serverList)[i],
            value : `selection${i}`
        }
        
        data.Guilds[guildName].MenuOptions[i] = newJson;
        writeToJson(data);
    }

    // retrive Menu Options from JSON
    console.log('generating options')
    for (let i = 0; i < listSize; i++) {
        label[i] = JSON.stringify(data.Guilds[guildName].MenuOptions[i].label, null, 2).replace(/[""]/g, '')
        description[i] = JSON.stringify(data.Guilds[guildName].MenuOptions[i].description, null, 2).replace(/[""]/g, '')
        value[i] = JSON.stringify(data.Guilds[guildName].MenuOptions[i].value, null, 2).replace(/[""]/g, '')
    }

    // generate discord-readable format for options
    for (let i = 0; i < listSize; i++) {
        option[i] = ({label: label[i], description: description[i], value: value[i]})
    }
    console.log('done')
    return [option, label, value, description];
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

        // check server status
        util.status(MCServerIP)
            .then(async response => {   // status retrieved means server is online
                status = 1

                // if server status hasnt changed, update player count
                if (tmpStatus == 1 && status == 1) { 
                    const recievedEmbed = await (await message.channel.messages.fetch(MCEmbedId)).embeds[0];
                    const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed
                    newEmbed.setTitle(title)
                    newEmbed.fields[3] = { name: 'Online Players', value: "> " + response.players.online.toString() };

                    message.edit({ embeds: [newEmbed] });
                    console.log('refreshed player count')
                }

                // if server goes online (was offline)
                if (tmpStatus == 0 && status == 1) { 
                    const recievedEmbed = await (await message.channel.messages.fetch(MCEmbedId)).embeds[0];
                    const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed
                    newEmbed.setTitle(title)
                    newEmbed.fields[0] = []
                    newEmbed.fields[1] = { name: 'Server IP', value: "> " + MCServerIP }
                    newEmbed.fields[2] = { name: 'Modpack', value: "> " + response.motd.clean.toString() }
                    newEmbed.fields[3] = { name: 'Version', value: "> " + response.version.name.toString() }
                    newEmbed.fields[4] = { name: 'Online Players', value: "> " + response.players.online.toString() }
                    newEmbed.setFooter("Server Online");

                    message.edit({ embeds: [newEmbed] });
                    console.log('refreshed server status')
                }
            })
            // no status = invalid IP or server offline
            .catch(async (error) => {
                console.error("Server Offline")
                status = 0;

                const recievedEmbed = await (await message.channel.messages.fetch(MCEmbedId)).embeds[0];
                const newEmbed = new MessageEmbed(recievedEmbed)
                newEmbed.setTitle(title)
                newEmbed.fields[0] = { name: "Server Offline", value: "all good" }
                newEmbed.fields[1] = []
                newEmbed.fields[2] = []
                newEmbed.fields[3] = []
                newEmbed.fields[4] = []
                newEmbed.setFooter('');

                message.edit({ embeds: [newEmbed] });
                console.log('refreshed server status')
            });

        tmpStatus = status;
    }
}


/**
 * writes data to data.JSON file
 * @param  {string} data
 */
function writeToJson(data) {
    fs.writeFile('./data.json', JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}
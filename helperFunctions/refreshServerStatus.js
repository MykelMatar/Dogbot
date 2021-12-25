const { MessageEmbed } = require('discord.js');
const util = require('minecraft-server-util');
const data = require('../data.json');
let tmpStatus = 0;
let status = 0;

/**
 * Refreshes mc server embed
 * @param  {string} message
 * @param  {string} guildName
 */
 async function refreshServerStatus(message, guildName) {
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

module.exports = refreshServerStatus;
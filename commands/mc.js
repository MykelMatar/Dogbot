const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const util = require('minecraft-server-util');
const runMcButtonCollector = require('../helperFunctions/runMcButtonCollector');
const data = require('../data.json');
let cmdStatus = 0;







module.exports = {
    name: 'mc',
    description: "Retrieves MC server status from selectedServer in JSON and displays information in embed. 2 buttons: 'changemc', 'listmc'. DOES NOT REQUIRE ADMIN PERMS",
    async execute(client, message, args, guildName){
        console.log('mc detected');
        
        // prevent multiple instances from running
        if (cmdStatus == 1) { return message.reply('mc command already running.') } // prevent multiple instances from running
        cmdStatus = 1; 

        // retrieve required JSON data
        let MCEmbedId = data.Guilds[guildName].Embeds.MCEmbedId;
        let MCServerIP = JSON.stringify(data.Guilds[guildName].MCData.selectedServer["IP"]).replace(/[""]/g, '')
        let title = JSON.stringify(data.Guilds[guildName].MCData.selectedServer["title"]).replace(/[""]/g, '')
        var sent;
  

        // Generate buttons
        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('Change')
              .setLabel('Change')
              .setStyle('PRIMARY'),
            new MessageButton()
              .setCustomId('List')
              .setLabel('Server List')
              .setStyle('SECONDARY'),
          )

        // Check Server Status
        util.status(MCServerIP) // port default is 25565
          .then(async (response) => {
            console.error('Server Online')

            // create Embed w/ server info (use console.log(response) for extra information about server)
            const Embed = new MessageEmbed()
              .setTitle(title)
              .addFields(
                { name: 'Server IP',      value: `>  ${MCServerIP.toString()}` },
                { name: 'Modpack',        value: `> [${response.motd.clean.toString()}](https://www.curseforge.com/minecraft/modpacks)` },
                { name: 'Version',        value: `>  ${response.version.name.toString()}` },
                { name: 'Online Players', value: `>  ${response.players.online.toString()}` },
              )
              .setColor("#8570C1")
              .setFooter('Server Online')

            sent = await message.reply({ ephemeral: true, embeds: [Embed], components: [row]})
            runMcButtonCollector(client, message, args, guildName, sent)
          })

          .catch(async (error) => {
            console.error('Server Offline')

            // create Embed to display server offline (its an embed to allow for editing during server info refresh)
            const Embed = new MessageEmbed()
              .setTitle(title)
              .addField("Server Offline", "all good")   // ? add cmd to change server offline message ?
              .setColor("#8570C1");

            // generate empty fields to edit later if server goes online
            Embed.fields[1] = []  
            Embed.fields[2] = []
            Embed.fields[3] = []
            Embed.fields[4] = [];
            Embed.setFooter('');

            // send embed at collect response
            sent = await message.reply({ ephemeral: true, embeds: [Embed], components: [row]})
            const msgCollector = message.channel.createMessageCollector({ time: 15000 })
            runMcButtonCollector(client, message, args, guildName, sent)
          });
    } 
}



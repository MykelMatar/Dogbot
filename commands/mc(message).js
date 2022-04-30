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
        
        let serverList = data.Guilds[guildName].MCData.serverList;
        let serverListSize = Object.values(serverList).length

        // ensures command does not execute if 0 or 1 server exists
        if (serverListSize == 0) {
            return message.reply('No Registered Servers, use !addmc or !listmc to add servers.')
        }

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
            const embed = new MessageEmbed()
              .setTitle(title)
              .addFields(
                { name: 'Server IP',      value: `>  ${MCServerIP.toString()}` },
                { name: 'Modpack',        value: `> [${response.motd.clean.toString()}](https://www.curseforge.com/minecraft/modpacks)` },
                { name: 'Version',        value: `>  ${response.version.name.toString()}` },
                { name: 'Online Players', value: `>  ${response.players.online.toString()}` },
              )
              .setColor("#8570C1")
              .setFooter('Server Online')

            sent = await interaction.updateReply({ ephemeral: true, embeds: [embed], components: [row]})
            runMcButtonCollector(client, interaction, args, guildName, sent)
          })

          .catch(async (error) => {
            console.error('Server Offline')

            // create embed to display server offline (its an embed to allow for editing during server info refresh)
            const embed = new MessageEmbed()
              .setTitle(title)
              .addField("Server Offline", "all good")   // ? add cmd to change server offline message ?
              .setColor("#8570C1");

            // generate empty fields to edit later if server goes online
            embed.fields[1] = []  
            embed.fields[2] = []
            embed.fields[3] = []
            embed.fields[4] = []
            embed.setFooter('')

            // send embed at collect response
            sent = await interaction.updateReply({ ephemeral: true, embeds: [embed], components: [row]})
            const msgCollector = message.channel.createMessageCollector({ time: 15000 })
            runMcButtonCollector(client, interaction, args, guildName, sent)
          });
    } 
}



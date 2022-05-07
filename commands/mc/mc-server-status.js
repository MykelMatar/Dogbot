const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const util = require('minecraft-server-util');
const runMcButtonCollector = require('../../helperFunctions/runMcButtonCollector');
const data = require('../../data.json');




module.exports = {
    name: 'mc-server-status',
    description: "Retrieves MC server status from selectedServer in JSON and displays information in embed. 2 buttons: 'changemc', 'listmc'. DOES NOT REQUIRE ADMIN PERMS",
    async execute(client, interaction, guildName){
        console.log(`mc-server-status requested by ${interaction.member.user.username}`);
        
        let serverList = data.Guilds[guildName].MCData.serverList;
        let serverListSize = Object.values(serverList).length

        // ensures command does not execute if 0 or 1 server exists
        if (serverListSize == 0) {
            return interaction.editReply('No Registered Servers, use !addmc or !listmc to add servers.')
        }

        // retrieve required JSON data
        let MCServerIP = JSON.stringify(data.Guilds[guildName].MCData.selectedServer["IP"]).replace(/[""]/g, '')
        let title = JSON.stringify(data.Guilds[guildName].MCData.selectedServer["title"]).replace(/[""]/g, '')
  

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

            await interaction.editReply({ ephemeral: true, embeds: [embed], components: [row]})
            runMcButtonCollector(client, interaction, guildName, sent) 
          })
          .catch(async (error) => {
            console.error('Server Offline')

            // create embed to display server offline (its an embed to allow for editing during server info refresh)
            const embed = new MessageEmbed()
              .setTitle(title)
              .addField("Server Offline", "all good")   // ? add cmd to change server offline interaction ?
              .setColor("#8570C1");

            // generate empty fields to edit later if server goes online
            embed.fields[1] = []  
            embed.fields[2] = []
            embed.fields[3] = []
            embed.fields[4] = []
            embed.setFooter('')

            // send embed at collect response
            await interaction.editReply({ephemeral: true, embeds: [embed], components: [row]})
            runMcButtonCollector(client, interaction, guildName)
          });
    } 
}
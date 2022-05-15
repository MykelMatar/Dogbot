const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const util = require('minecraft-server-util');
const runMcButtonCollector = require('../../helperFunctions/runMcButtonCollector');
const guilds = require("../../schemas/guild-schema");




module.exports = {
    name: 'mc-server-status',
    description: "Retrieves MC server status from selectedServer in JSON and displays information in embed. 2 buttons: 'changemc', 'listmc'. DOES NOT REQUIRE ADMIN PERMS",
    async execute(client, interaction, guildName){
        console.log(`mc-server-status requested by ${interaction.member.user.username}`);

        // retrieve server doc and list from mongo
        const currentGuild = await guilds.find({guildId: interaction.guildId})
        let serverList = currentGuild[0].MCServerData.serverList
        
        // ensures command does not execute if 0 or 1 server exists
        if (serverList.length === 0) {
            return interaction.editReply('No Registered Servers, use !addmc or !listmc to add servers.')
        }

        // retrieve required JSON data
        let title = currentGuild[0].MCServerData.selectedServer.name
        let MCServerIP = currentGuild[0].MCServerData.selectedServer.ip
        
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
            console.log('Server Online')

            // create Embed w/ server info (use console.log(response) for extra information about server)
            const embed = new MessageEmbed()
              .setTitle(title)
              .addFields(
                { name: 'Server IP',      value: `>  ${MCServerIP.toString()}` },
                { name: 'Modpack',        value:  `> ${response.motd.clean.toString()}`},
                  //`> [${response.motd.clean.toString()}](https://www.curseforge.com/minecraft/modpacks)`
                { name: 'Version',        value: `>  ${response.version.name.toString()}` },
                { name: 'Online Players', value: `>  ${response.players.online.toString()}` },
              )
              .setColor("#8570C1")
              .setFooter('Server Online')

            await interaction.editReply({ ephemeral: true, embeds: [embed], components: [row]})
            runMcButtonCollector(client, interaction, guildName) 
          })
          .catch(async (error) => {
            console.log('Server Offline')

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

            // send embed and collect response
            await interaction.editReply({ephemeral: true, embeds: [embed], components: [row]})
            runMcButtonCollector(client, interaction, guildName)
          });
    } 
}
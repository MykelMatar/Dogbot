const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const util = require('minecraft-server-util');
const data = require('../data.json');
let cmdStatus = 0;
var sent;





module.exports = {
    name: 'mc',
    description: "Retrieves MC server status from selectedServer in JSON and displays information in embed. 2 buttons: 'changemc', 'listmc'. DOES NOT REQUIRE ADMIN PERMS",
    async execute(client, message, args, guildName){
        console.log('mc detected');
        
        // prevent multiple instances from running
        if(cmdStatus == 1) {
            message.reply('Command already running. Use !changemc to change server.')
            return;
        }
        cmdStatus = 1;  

        // retrieve required JSON data
        let MCEmbedId = data.Guilds[guildName].Embeds.MCEmbedId;
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
            const Embed = new MessageEmbed()
              .setTitle(title)
              .addFields(
                { name: 'Server IP',      value: "> " + MCServerIP.toString()},
                { name: 'Modpack',        value: "> " + response.motd.clean.toString()},
                { name: 'Version',        value: "> " + response.version.name.toString()},
                { name: 'Online Players', value: "> " + response.players.online.toString()},
              )
              .setColor("#8570C1")
              .setFooter('Server Online')

            sent = await message.reply({ ephemeral: true, embeds: [Embed], components: [row]})
            runButtonCollector(client, message, args, guildName)
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
            runButtonCollector(client, message, args, guildName)
          });
    } 
}


/**
 * collection and interaction handling
 * @param  {string} client
 * @param  {string} message
 * @param  {string} args
 * @param  {string} guildName
 */
function runButtonCollector(client, message, args, guildName) {
  const filter = i => i.user.id === message.author.id;
  const collector = message.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', max: 1, time: 10000 }); // only message author can interact, 1 response, 10s timer 
  const command1 = client.commands.get('changemc');
  const command2 = client.commands.get('listmc');

  
  collector.on('collect', async i => {
    if (i.customId === 'Change') {
      await i.update({ content: 'Server Change Requested', components: []});
      await command1.execute(client, message, args, guildName);
    }
    else if (i.customId === 'List') {
      await i.update({ content: 'Server List Requested', components: []});
      await command2.execute(client, message, args, guildName);
    }
  });

  collector.on('end', async collected => {
      if (collected.size == 1) console.log('button pressed');
      else {
          console.log('no button pressed')
          await sent.edit({ ephemeral: true, embeds: [sent.embeds[0]], components: [] })  // remove buttons
      };
  });
}
  


/**
 * writes data to data.JSON file
 * @param  {string} data
 */
function writeToJson(data) {
  fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
    if (err) throw err;
  });
}

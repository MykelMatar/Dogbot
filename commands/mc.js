const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const util = require('minecraft-server-util');
const data = require('../data.json');
let cmdStatus = 0;






module.exports = {
    name: 'mc',
    description: "Retrieves MC server status",
    async execute(client, message, args, guildName){
      if(cmdStatus == 1) {
        message.reply('Command already running. Use !changemc to change server.')
        return;
      }

      let MCEmbedId = data.Guilds[guildName].Embeds.MCEmbedId;
      let MCServerIP = JSON.stringify(data.Guilds[guildName].MCData.selectedServer["IP"]).replace(/[""]/g, '')
      let title = JSON.stringify(data.Guilds[guildName].MCData.selectedServer["title"]).replace(/[""]/g, '')

      console.log(MCServerIP);
      cmdStatus = 1;
      // button to change server
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

      
      util.status(MCServerIP) // port default is 25565
        .then(async (response) => {
          console.log(response)

          const Embed = new MessageEmbed()
            .setTitle(title)
            .addFields(
              { name: 'Server IP',      value: "> " + MCServerIP.toString()},               // Discord.js v13 requires manual call of toString on all methods
              { name: 'Modpack',        value: "> " + response.motd.clean.toString()},
              { name: 'Version',        value: "> " + response.version.name.toString()},
              { name: 'Online Players', value: "> " + response.players.online.toString()},
            )
            .setColor("#8570C1")
            .setFooter('Server Online')

          await message.reply({ ephemeral: true, embeds: [Embed], components: [row]})
          runButtonCollector(client, message, args, guildName)
        })
        .catch(async (error) => {
          console.error('Server Offline')

          const Embed = new MessageEmbed()
            .setTitle(title)
            .addField("Server Offline", "all good")
            .setColor("#8570C1");
          Embed.fields[1] = []
          Embed.fields[2] = []
          Embed.fields[3] = []
          Embed.fields[4] = [];
          Embed.setFooter('');

          await message.reply({ ephemeral: true, embeds: [Embed], components: [row]})
          runButtonCollector(client, message, args, guildName)
          
        });
    }
}



function runButtonCollector(client, message, args, guildName) {
  const filter = i => i.user.id === message.author.id;
  const collector = message.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });
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

  collector.on('end', collected => {
    if (collected.size == 1) console.log('button pressed');
    else console.log('no button pressed');
  });
}
  


//writes to data.json
function writeToJson(data) {
  fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
    if (err) throw err;
  });
}

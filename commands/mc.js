const { MessageEmbed, MessageActionRow } = require('discord.js');
const { clearInterval } = require('timers');
const util = require('minecraft-server-util');
const data = require('../data.json');
let cmdStatus = 0;
let tmpStatus = 0;
let status = 0;



module.exports = {
    name: 'mc',
    description: "Retrieves MC server status",
    async execute(client, message, args, guildName){
      let MCEmbedId = data.Guilds[guildName].Embeds.MCEmbedData["id"];
      let MCServerIP = Object.values(data.Guilds[guildName].MCData["selectedServer"])
      console.log(MCServerIP);
      cmdStatus = 1;

      // button to change server
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('Change')
            .setLabel('Change Server')
            .setStyle('PRIMARY'),
        )

      
      //unpinEmbed(message, embedID);
      util.status(MCServerIP) // port default is 25565
        .then(async (response) => {
          console.log(response)
          status = 1;
          tmpStatus = 1;

          const Embed = new MessageEmbed()
            .setTitle("Dogbert's Server 2.0")
            .addFields(
              { name: 'Server IP',      value: "> " + MCServerIP.toString()},               // Discord.js v13 requires manual call of toString on all methods
              { name: 'Modpack',        value: "> " + response.motd.clean.toString()},
              { name: 'Version',        value: "> " + response.version.name.toString()},
              { name: 'Online Players', value: "> " + response.players.online.toString()},
            )
            .setColor("#8570C1")
            .setFooter('Server Online')

          await message.reply({ ephemeral: true, embeds: [embed], components: [row]})
          //message.channel.send({ embeds: [Embed] });
          //message.pin();
        })
        .catch(async (error) => {
          console.error('Server Offline')
          status = 0;

          const Embed = new MessageEmbed()
            .setTitle("Dogbert's Server 2.0")
            .addField("Server Offline", "all good")
            .setColor("#8570C1");
          Embed.fields[1] = []
          Embed.fields[2] = []
          Embed.fields[3] = []
          Embed.fields[4] = [];
          Embed.setFooter('');

          await message.reply({ ephemeral: true, embeds: [embed], components: [row]})
          //message.channel.send({ embeds: [Embed] });    // v13: send({embeds: [Embed]})
        });
    }
}



async function refreshStatus(messageCreate, guildname) {
  if (messageCreate.author.bot) {

    util.status(MCServerIP)
      .then(async response => {
        status = 1
        if (tmpStatus == 1 && status == 1) { // if server status hasnt changed, update player count
          const recievedEmbed = await (await messageCreate.channel.messages.fetch(embedID)).embeds[0];
          const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed
          newEmbed.fields[3] = { name: 'Online Players', value: "> " + response.players.online.toString() };

          messageCreate.edit({ embeds: [newEmbed] });
          console.log('refreshed player count')
        }
        if (tmpStatus != status) // if server status changed, update embed
          if (tmpStatus == 0 && status == 1) { // if server goes online

            const recievedEmbed = await (await messageCreate.channel.messages.fetch(embedID)).embeds[0];
            const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed
            newEmbed.fields[0] = []
            newEmbed.fields[1] = { name: 'Server IP',      value: "> " + MCServerIP.toString()}
            newEmbed.fields[2] = { name: 'Modpack',        value: "> " + response.motd.clean.toString()}
            newEmbed.fields[3] = { name: 'Version',        value: "> " + response.version.name.toString()}
            newEmbed.fields[4] = { name: 'Online Players', value: "> " + response.players.online.toString()}
            newEmbed.setFooter("Server Online");

            messageCreate.edit({ embeds: [newEmbed] });
            console.log('refreshed server status')
          }
      })
      .catch(async (error) => {
        console.error("Server Offline")
        status = 0;

        const recievedEmbed = await (await messageCreate.channel.messages.fetch(embedID)).embeds[0];
        const newEmbed = new MessageEmbed(recievedEmbed)
        newEmbed.fields[0] = { name: "Server Offline", value: "all good" };
        newEmbed.fields[1] = [];
        newEmbed.fields[2] = [];
        newEmbed.fields[3] = [];
        newEmbed.fields[4] = [];
        newEmbed.setFooter('');

        messageCreate.edit({ embeds: [newEmbed] });
        console.log('refreshed server status')
      });
    tmpStatus = status;
  }
}


// async function unpinEmbed(message, MCEmbedId) {
//     if (embedId != null) {
//         (await message.channel.messages.fetch(embedId)).unpin();
//     }
// }
  
  
//writes to data.json
function writeToJson(data) {
  fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
    if (err) throw err;
  });
}
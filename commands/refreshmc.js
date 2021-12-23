const { MessageEmbed } = require('discord.js');
const { clearInterval } = require('timers');
let tmpStatus = 0;
let status = 0;


module.exports = {
    name: 'refreshmc', 
    description: 'refreshes mc server status embed', 
    async execute(client, message, args, guildName){
        if (message.author.bot) {
            clearInterval(refresh)
            let MCEmbedId = data.Guilds[guildName].Embeds.MCEmbedData["id"];
            let MCServerIP = JSON.stringify(data.Guilds[guildName].MCData.selectedServer["IP"]).replace(/[""]/g, '')

            var refresh = setInterval(refreshStatus, 10000, message, guildName, MCEmbedId, MCServerIP, title); // 300000 = 5 min
        }    
    }
}


async function refreshStatus(message, guildName, embedId, IP) {
    if (message.author.bot) {
      let embedId = data.Guilds[guildName].EmbedData["id"];
  
      util.status(IP)
        .then(async response => {
          status = 1
          if (tmpStatus == 1 && status == 1) { // if server status hasnt changed, update player count
            const recievedEmbed = await (await message.channel.messages.fetch(embedID)).embeds[0];
            const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed
            newEmbed.fields[3] = { name: 'Online Players', value: "> " + response.players.online.toString() };
  
            message.edit({ embeds: [newEmbed] });
            console.log('refreshed player count')
          }
          if (tmpStatus != status) // if server status changed, update embed
            if (tmpStatus == 0 && status == 1) { // if server goes online
  
              const recievedEmbed = await (await message.channel.messages.fetch(embedID)).embeds[0];
              const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed
              newEmbed.fields[0] = []
              newEmbed.fields[1] = { name: 'Server IP',      value: "> " + IP.toString()}
              newEmbed.fields[2] = { name: 'Modpack',        value: "> " + response.motd.clean.toString()}
              newEmbed.fields[3] = { name: 'Version',        value: "> " + response.version.name.toString()}
              newEmbed.fields[4] = { name: 'Online Players', value: "> " + response.players.online.toString()}
              newEmbed.setFooter("Server Online");
  
              message.edit({ embeds: [newEmbed] });
              console.log('refreshed server status')
            }
        })
        .catch(async (error) => {
          console.error("Server Offline")
          status = 0;
  
          const recievedEmbed = await (await message.channel.messages.fetch(embedID)).embeds[0];
          const newEmbed = new MessageEmbed(recievedEmbed)
          newEmbed.fields[0] = { name: "Server Offline", value: "all good" };
          newEmbed.fields[1] = [];
          newEmbed.fields[2] = [];
          newEmbed.fields[3] = [];
          newEmbed.fields[4] = [];
          newEmbed.setFooter('');
  
          message.edit({ embeds: [newEmbed] });
          console.log('refreshed server status')
        });
      tmpStatus = status;
  
    }
  }
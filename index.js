const {Client, MessageEmbed, Message} = require('discord.js-12');
const util = require('minecraft-server-util');
const config = require('./config.json');
const data = require("./data.json");
const { clearInterval } = require('timers');
const client = new Client(); //({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });   // Discord.js 13 requires user to specify all intents that the bot uses
const fs = require("fs");
const PREFIX = '!'
let tmpStatus = 0;
let status = 0;

client.once('ready', () => {
    console.log('ready');
});


client.on("guildCreate", async function(guild) {
    if (!("Guilds" in data)) {
      var gData = {
          Guilds: {},
      };
      writeToJson(gData);
    }
  
    let guildName = guild.name.replace(/\s+/g, ""); //removes whitespace from string
    let newJson = {
      ServerData: {
        serverId: guild.id,
      },
      EmbedData: {
        Title: "test",
        Fields: {
          'Server Offline':"", 
          ServerIP: "N/A",
          Modpack: "N/A",
          Version: "N/A",
          'Online Players': "N/A",
          Footer: "N/A",
        },
        id: "1",
      },
    };
    data.Guilds[guildName] = newJson;
    writeToJson(data);
});



client.login(config.bot_token);



client.on("message", async (message) =>{  // Discord.js v13 renamed 'message' event to 'messageCreate'

    let guildname = message.guild.name.replace(/\s+/g, "");
    let embedID = data.Guilds[guildname].EmbedData["id"];
    let args = message.content.substring(PREFIX.length).split(' ')

    // command
    if(message.content == "!mc"){
        clearInterval(refresh);
        util.status(config.server_ip) // port default is 25565
            .then((response) => {
                console.log(response)
                status = 1;
                tmpStatus = 1;
                const Embed = new MessageEmbed()
                .setTitle("Dogbert's Server 2.0")
                .addFields(
                    {name: 'Server IP',      value: "> " + response.host.toString()},               // Discord.js v13 requires manual call of toString on all methods
                    {name: 'Modpack',        value: "> " + response.description.toString()},
                    {name: 'Version',        value: "> " + response.version.toString()},
                    {name: 'Online Players', value: "> " + response.onlinePlayers.toString()},
                    )
                .setColor("#8570C1")
                .setFooter('Server Online')
              message.channel.send(Embed); 
              // Embed.fields[0] = [];
              // updateEmbedData(Embed, guildname);
              data.Guilds[guildname].EmbedData.Title = Embed.title;
              data.Guilds[guildname].EmbedData.Fields["Server Offline"] = []; 
              data.Guilds[guildname].EmbedData.Fields["ServerIP"] = Embed.fields[1].value; 
              data.Guilds[guildname].EmbedData.Fields["Modpack"]  = Embed.fields[2].value; 
              data.Guilds[guildname].EmbedData.Fields["Version"]  = Embed.fields[3].value;
              data.Guilds[guildname].EmbedData.Fields["Online Players"]  = response.onlinePlayers.toString();
              data.Guilds[guildname].EmbedData.Fields["Footer"] = "Server Online";
              writeToJson(data);
            })
            .catch((error) => {
                console.error(error)
                status = 0;
                const Embed = new MessageEmbed()
                .setTitle("Dogbert's Server 2.0")
                .addField("Server Offline", "all good")
                .setColor("#8570C1")
                // Embed.fields[1] = [];
                // Embed.fields[2] = [];
                // Embed.fields[3] = [];
                // Embed.fields[4] = [];
                // Embed.fields[5] = [];
                message.channel.send(Embed);    // v13: send({embeds: [Embed]})
                
                data.Guilds[guildname].EmbedData.Title = Embed.title;
                data.Guilds[guildname].EmbedData.Fields["Server Offline"] = Embed.fields[0].value; 
                data.Guilds[guildname].EmbedData.Fields["ServerIP"] = []; 
                data.Guilds[guildname].EmbedData.Fields["Modpack"]  = []; 
                data.Guilds[guildname].EmbedData.Fields["Version"]  = [];
                data.Guilds[guildname].EmbedData.Fields["Online Players"]  = []; 
                data.Guilds[guildname].EmbedData.Fields["Footer"] = [];
                writeToJson(data);
            });  
    }

    if (message.embeds[0]) {
      //push embed id to json
      data.Guilds[guildname].EmbedData["id"] = message.id;
      writeToJson(data);
      var refresh = setInterval(refreshStatus, 10000, message, guildname);
  }


});

//writes to data.json
function writeToJson(data) {
    fs.writeFile("./data.json", JSON.stringify(data, null, 4), function(err) {
      if (err) throw err;
    });
  }

  function updateEmbedData(Embed, guildname){
    data.Guilds[guildname].EmbedData.Title = Embed.title;
    data.Guilds[guildname].EmbedData.Fields["Server Offline"] = Embed.fields[0].value; 
    data.Guilds[guildname].EmbedData.Fields["ServerIP"] = Embed.fields[1].value; 
    data.Guilds[guildname].EmbedData.Fields["Modpack"]  = Embed.fields[2].value; 
    data.Guilds[guildname].EmbedData.Fields["Version"]  = Embed.fields[3].value;
    data.Guilds[guildname].EmbedData.Fields["Online Players"]  = Embed.fields[4].value; 
    data.Guilds[guildname].EmbedData.Fields["Footer"] = Embed.footer;
    writeToJson(data);
  }

      // helper function
      async function refreshStatus(message, guildname){
        if (message.author.bot) {
          let embedID = data.Guilds[guildname].EmbedData["id"];
  
          util.status(config.server_ip)
            .then(async response => {
              if(tmpStatus == 1 && status == 1){ // if server status hasnt changed, update player count
                const recievedEmbed =  await (await message.channel.messages.fetch(embedID)).embeds[0];
                const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed
                newEmbed.fields[3] = {name: 'Online Players', value: "> " + response.onlinePlayers.toString()};
                message.edit(newEmbed);
                console.log('refreshed player count')

                data.Guilds[guildname].EmbedData.Fields["Online Players"]  = response.onlinePlayers.toString(); 
                writeToJson(data);
            }
            if(tmpStatus != status) // if server status changed, update embed
                if (tmpStatus == 0 && status == 1){ // if server goes online
                    const recievedEmbed =  await (await message.channel.messages.fetch(embedID)).embeds[0];
                    const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed
                    newEmbed.fields[0] = []
                    newEmbed.fields[1] = {name: 'Server IP',      value: "> " + response.host}
                    newEmbed.fields[2] = {name: 'Modpack',        value: "> " + response.description.toString()}
                    newEmbed.fields[3] = {name: 'Version',        value: "> " + response.version.toString()}
                    newEmbed.fields[4] = {name: 'Online Players', value: "> " + response.onlinePlayers.toString()}
                    newEmbed.setFooter = "Server Online";
                    message.edit(newEmbed);
                    console.log('refreshed server status')
  
                    data.Guilds[guildname].EmbedData.Title = newEmbed.title;
                    data.Guilds[guildname].EmbedData.Fields["Server Offline"] = []; 
                    data.Guilds[guildname].EmbedData.Fields["ServerIP"] = newEmbed.fields[1].value; 
                    data.Guilds[guildname].EmbedData.Fields["Modpack"]  = newEmbed.fields[2].value; 
                    data.Guilds[guildname].EmbedData.Fields["Version"]  = newEmbed.fields[3].value;
                    data.Guilds[guildname].EmbedData.Fields["Online Players"]  = newEmbed.fields[4].value; 
                    data.Guilds[guildname].EmbedData.Fields["Footer"] = "Server Online";
                    writeToJson(data);
    
                }
                else if(tmpStatus == 1 && status == 0){ // if server goes offline
                    const recievedEmbed = await (await message.channel.messages.fetch(embedID)).embeds[0];
                    const newEmbed = new MessageEmbed(recievedEmbed) 
                    newEmbed.fields[0] = {name: "Server Offline", value: "all good"};
                    message.edit(newEmbed);
                    console.log('refreshed server status')
  
                    data.Guilds[guildname].EmbedData.Title = Embed.title;
                    data.Guilds[guildname].EmbedData.Fields["Server Offline"] = Embed.fields[0].value; 
                    data.Guilds[guildname].EmbedData.Fields["ServerIP"] = []; 
                    data.Guilds[guildname].EmbedData.Fields["Modpack"]  = []; 
                    data.Guilds[guildname].EmbedData.Fields["Version"]  = [];
                    data.Guilds[guildname].EmbedData.Fields["Online Players"]  = []; 
                    data.Guilds[guildname].EmbedData.Fields["Footer"] = [];
                    writeToJson(data);
                }
                
            })
          //   .catch((error) => {
          //     console.error(error)
          //     status = 0;
          //     const recievedEmbed = await (await message.channel.messages.fetch(embedID)).embeds[0];
          //     const newEmbed = new MessageEmbed(recievedEmbed) 
          //     newEmbed.fields[0] = {name: "Server Offline", value: "all good"};
          //     message.edit(newEmbed);
          //     console.log('refreshed server status')

          //     data.Guilds[guildname].EmbedData.Title = Embed.title;
          //     data.Guilds[guildname].EmbedData.Fields["Server Offline"] = Embed.fields[0].value; 
          //     data.Guilds[guildname].EmbedData.Fields["ServerIP"] = []; 
          //     data.Guilds[guildname].EmbedData.Fields["Modpack"]  = []; 
          //     data.Guilds[guildname].EmbedData.Fields["Version"]  = [];
          //     data.Guilds[guildname].EmbedData.Fields["Online Players"]  = []; 
          //     data.Guilds[guildname].EmbedData.Fields["Footer"] = [];
          //     writeToJson(data);
          // });
          tmpStatus = status;
      }
    }
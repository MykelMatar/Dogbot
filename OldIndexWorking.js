const { Client, MessageEmbed, Message } = require('discord.js');
const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });   // Discord.js 13 requires user to specify all intents that the bot uses
const util = require('minecraft-server-util');
const data = require("./data.json");
const { clearInterval } = require('timers');
const fs = require("fs");
const PREFIX = '!'
let cmdStatus = 0;
let tmpStatus = 0;
let status = 0;


client.once('ready', () => {
  console.log('ready');
});


client.on("guildCreate", async function (guild) {
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
      id: "1"
    },
  };
  data.Guilds[guildName] = newJson;
  writeToJson(data);
});



client.login(process.env.bot_token);



client.on("messageCreate", async (message) => {  // Discord.js v13 renamed 'message' event to 'messageCreate'

  let guildname = message.guild.name.replace(/\s+/g, "");
  let embedID = data.Guilds[guildname].EmbedData["id"];
  let args = message.content.substring(PREFIX.length).split(' ')

  // command
  if (message.content == "!mc" && cmdStatus == 0) {
    clearInterval(refresh);       // clear existing refreshes
    unpinEmbed(message, embedID);
    cmdStatus = 1;
    util.status(process.env.server_ip) // port default is 25565
      .then((response) => {
        console.log(response)
        status = 1;
        tmpStatus = 1;

        const Embed = new MessageEmbed()
          .setTitle("Dogbert's Server 2.0")
          .addFields(
            { name: 'Server IP',      value: "> " + process.env.server_ip.toString()},               // Discord.js v13 requires manual call of toString on all methods
            { name: 'Modpack',        value: "> " + response.motd.clean.toString()},
            { name: 'Version',        value: "> " + response.version.name.toString()},
            { name: 'Online Players', value: "> " + response.players.online.toString()},
          )
          .setColor("#8570C1")
          .setFooter('Server Online')

        message.channel.send({ embeds: [Embed] });
        message.pin();
      })
      .catch((error) => {
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

        message.channel.send({ embeds: [Embed] });    // v13: send({embeds: [Embed]})
      });
  }

  if (message.embeds[0] && message.author.bot) {
    //push embed id to json
    data.Guilds[guildname].EmbedData["id"] = message.id;
    writeToJson(data);
    var refresh = setInterval(refreshStatus, 300000, message, guildname); // 300000 = 5 min
  }

   //deletes commands to make it look cleaner
   if (message.content.startsWith("!mc") || message.system) {
    message.delete();
}
});




async function refreshStatus(messageCreate, guildname) {
  if (messageCreate.author.bot) {
    let embedID = data.Guilds[guildname].EmbedData["id"];

    util.status(process.env.server_ip)
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
            newEmbed.fields[1] = { name: 'Server IP',      value: "> " + process.env.server_ip.toString()}
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


async function unpinEmbed(message, embedId) {
    if (embedId != null) {
        (await message.channel.messages.fetch(embedId)).unpin();
    }
}


//writes to data.json
function writeToJson(data) {
  fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
    if (err) throw err;
  });
}

// check memory usage of bot
const used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
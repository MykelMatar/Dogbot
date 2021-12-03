const {Client, MessageEmbed, Message} = require('discord.js-12');
const config = require('./config.json');
const util = require('minecraft-server-util')
const client = new Client() //({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });   // Discord.js 13 requires user to specify all intents that the bot uses
const PREFIX = '!'


client.once('ready', () => {
    console.log('ready');
});

client.on('message', message =>{  // Discord.js v13 renamed 'message' event to 'messageCreate'

    let args = message.content.substring(PREFIX.length).split(' ')
    let tmpStatus = 0;
    let status = 0;


    function serverOfflineReponse(){
        const Embed = new MessageEmbed()
            .setTitle("Dogbert's Server 2.0")
            .addField("Server Offline", "all good")
            .setColor("#8570C1")

        message.channel.send(Embed);    // v13: send({embeds: [Embed]})
    }

    function serverOnlineResponse(){
        const Embed = new MessageEmbed()
            .setTitle("Dogbert's Server 2.0")
            .addFields(
                {name: 'Server IP',      value: "> " + response.host},               // Discord.js v13 requires manual call of toString on all methods
                {name: 'Modpack',        value: "> " + response.description.toString()},
                {name: 'Version',        value: "> " + response.version.toString()},
                {name: 'Online Players', value: "> " + response.onlinePlayers.toString()},
                )
            .setColor("#8570C1")
            .setFooter('Server Online')

        message.channel.send(Embed);    // v13: send({embeds: [Embed]})
    }

    function refreshStatus(){
        util.status(config.server_ip)
        console.log(response);
        if(tmpStatus != status){
            if(tmpStatus == 1 && status == 1){ 
                const recievedEmbed = await (await message.channel.messages.fetch(embedID)).embeds[0];
                const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed
                newEmbed.Fields[1] = {name: 'Online Players', value: "> " + response.onlinePlayers.toString()}
            }
            else if (tmpStatus == 0 && status == 1){ // if server goes online
                const recievedEmbed = await (await message.channel.messages.fetch(embedID)).embeds[0];
                const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed
                newEmbed.Fields[1] = {name: 'Server IP',      value: "> " + response.host}
                newEmbed.Fields[1] = {name: 'Modpack',        value: "> " + response.description.toString()}
                newEmbed.Fields[1] = {name: 'Version',        value: "> " + response.version.toString()}
                newEmbed.Fields[1] = {name: 'Online Players', value: "> " + response.onlinePlayers.toString()}
                newEmbed.Footer = "Server Online"
            }
            else if(tmpStatus == 1 && status == 0){ // if server goes offline
                const recievedEmbed = await (await message.channel.messages.fetch(embedID)).embeds[0];
                const newEmbed = new MessageEmbed(recievedEmbed) 
                newEmbed.Fields[1] = {name: "Server Offline", value: "all good"};
            }
            tmpStatus = status
        }
    }

    const intervalObj = setInterval((refreshStatus) => {
        console.log("refreshed");
    }, 10000);     // 300000ms = 5m

    if(message.content == "!mc"){
        util.status(config.server_ip) // port default is 25565
            .then((response) => {
                console.log(response)
                status = 1;
                serverOnlineResponse();
            })
            .catch((error) => {
                console.error(error)
                status = 0;
                serverOfflineReponse();
            });
            intervalObj();
    }

    if (message.content === "!mc" || "!stop") {
        message.delete(); 
    }

    if(message.content == "stop"){
        clearTimeout(intervalObj);
    }
})

client.login(config.bot_token);


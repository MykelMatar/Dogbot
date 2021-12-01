const {Client, Intents, MessageEmbed, Message} = require('discord.js');
const config = require('./config.json');
const util = require('minecraft-server-util')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });   // Discord.js 13 requires user to specify all intents that the bot uses
const PREFIX = '!'


client.once('ready', () => {
    console.log('ready');
});

client.on('messageCreate', message =>{  // Discord.js v13 renamed 'message' event to 'messageCreate'

    let args = message.content.substring(PREFIX.length).split(' ')

    switch (args[0]){
        case 'mc' :
        util.status(config.server_ip) // port default is 25565
            .then((response) => {
                console.log(response);

                // create embed
                const Embed = new MessageEmbed()
                .setTitle('Server Status')
                .addFields(
                    {name: 'Server IP',      value: "> " + config.server_ip},      // Discord.js v13 requires manual call of toString on all methods
                    {name: 'Version',        value: "> " + response.version.name.toString()},
                    {name: 'Online Players', value: "> " + response.players.online.toString()},
                    )
                .setColor("#8570C1")

                message.channel.send({embeds: [Embed]});
            })
            .catch((error) => {
                console.error(error);
                message.channel.send({content: 'Server Offline'});
            });
        break;
    }
})

client.login(config.bot_token);


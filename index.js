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

    if(message.content == "!mc"){
        util.status(config.server_ip) // port default is 25565
            .then((response) => {
                console.log(response);

                // create embed
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
            })
            .catch((error) => {
                console.error(error);
                message.channel.send('Server Offline');  // v13: {content: 'Server Offline'}
            });
    }

    if (message.content == '!mc') {
        message.delete();
    }
})

client.login(config.bot_token);


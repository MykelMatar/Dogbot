const {Client, MessageEmbed, Message} = require('discord.js');
const config = require('./config.json');
const ping = require('minecraft-server-util')
const client = new Client();
const PREFIX = '!'



client.once('ready', () => {
    console.log('ready');
});

client.on('message', message =>{

    let args = message.content.substring(PREFIX.length).split(' ')

    switch (args[0]){
        case 'mc' :


            ping.status(config.server_ip) // port is default 25565
                .then((response) => {
                console.log(response);
                const Embed = new MessageEmbed();
                Embed.setTitle('Server Status');
                Embed.addField('Server IP', response.host);
                Embed.addField('Server Version',response.version);
                Embed.addField('Online Players', response.onlinePlayers);


                message.channel.send(Embed);

                
            })
                 .catch((error) => {
                console.error(error);
                message.channel.send('Server Offline');
            });
            
        break;
    }
})


client.login(config.bot_token);


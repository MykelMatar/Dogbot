const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const data = require('../data.json');
let cmdStatus = 0;




// TODO: add modpack to server list information


module.exports = {
    name: 'listmc',
    description: "Lists registered mc servers from JSON in an embed. 4 buttons: 'addmc', 'delmc', 'changemc', 'listmc'. DOES NOT REQUIRE ADMIN PERMS",
    async execute(client, message, args, guildName) {
        console.log('listmc detected');

        // prevent multiple instances from running
        if(cmdStatus == 1) {
            message.reply('listmc command already running.')
            return;
        }
        cmdStatus = 1;  

        let serverList = data.Guilds[guildName].MCData.serverList;

        // retrieve server names and IPs
        let serverNameList = JSON.stringify(Object.keys(serverList), null, 1)
            .replace(/[[\]]/g, '')
            .replace(/[""]/g, '')
            .replace(/[,]/g,  '');
        let serverIPList = JSON.stringify(Object.values(serverList), null, 1)
            .replace(/[[\]]/g, '')
            .replace(/[""]/g, '')
            .replace(/[,]/g,  '');
        
        // ensure list is never empty; embeds cannot receive empty values
        if (serverIPList == '') {   // using server IP List ensures a nameless IP is not overwritten
            serverNameList = "N/A"
            serverIPList = "N/A"
        }

        // generate buttons
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('Add')
                    .setLabel('Add')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('Remove')
                    .setLabel('Remove')
                    .setStyle('DANGER'),
                new MessageButton()
                    .setCustomId('Change')
                    .setLabel('Change')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('Rename')
                    .setLabel('Rename')
                    .setStyle('SECONDARY'),
            );

        // generate embed
        const embed = new MessageEmbed()
            .setTitle("Registered MC Servers")
            .addFields(
                { name: 'Server Name', value: serverNameList, inline: true },               // Discord.js v13 requires manual call of toString on all methods
                { name: 'IP'         , value: serverIPList,   inline: true },
            )
            .setColor("#8570C1")
            .setFooter(JSON.stringify(Object.values(serverList).length) + ' / 10 Servers Registered')

        let sent = await message.reply({ ephemeral: true, embeds: [embed], components: [row] })
        console.log(sent);

        // create collector
        const filter = i => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON',max: 1, time: 10000 }); // only message author can interact, 1 response, 10s timer 

        // retrieve commands for buttons
        const command1 = client.commands.get('addmc');
        const command2 = client.commands.get('delmc');
        const command3 = client.commands.get('changemc');
        const command4 = client.commands.get('renamemc');

        try {
            // collect response
            collector.on('collect', async i => {
                var update, execute;
                // interaction handling
                if (i.customId === 'Add') {
                    update = i.update({ content: 'Adding Server (If Possible)', components: [] });
                    execute = command1.execute(client, message, args, guildName);
                }
                else if (i.customId === 'Remove') {
                    update = i.update({ content: 'Removing Server', components: [] });
                    execute = command2.execute(client, message, args, guildName);
                }
                else if (i.customId === 'Change') {
                    update = i.update({ content: 'Changing Server', components: [] });
                    execute = command3.execute(client, message, args, guildName);
                }
                else if (i.customId === 'Rename') {
                    update = i.update({ content: 'Renaming Server', components: [] });
                    execute = command4.execute(client, message, args, guildName);
                }
                Promise.all([update, execute])
            });

            collector.on('end', async collected => {
                // check if button was presses when collector ends
                if (collected.size == 1) console.log('button pressed');
                else {
                    console.log('no button pressed')
                    await sent.edit({ ephemeral: true, embeds: [embed], components: [] })   // remove buttons
                };
            });
        } catch (error) {
            message.reply('Interaction Error, please try again')
        }

        cmdStatus = 0;
    }
}

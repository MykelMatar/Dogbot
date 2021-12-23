const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const data = require('../data.json');
const fs = require('fs');







module.exports = {
    name: 'listmc', 
    description: 'lists registered mc servers', 
    async execute(client, message, args, guildName){
        
        let serverNameList = JSON.stringify(Object.keys(data.Guilds[guildName].MCData.serverList), null, 1)
            .replace(/[[\]]/g, '')
            .replace(/[""]/g, '')
            .replace(/[,]/g,  '');
        let serverIPList = JSON.stringify(Object.values(data.Guilds[guildName].MCData.serverList), null, 1)
            .replace(/[[\]]/g, '')
            .replace(/[""]/g, '')
            .replace(/[,]/g,  '');
        
        if (serverNameList == '') serverNameList = "N/A"
        if (serverIPList == '') serverIPList = "N/A"

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
					.setCustomId('Add')
					.setLabel('Add Server')
					.setStyle('SUCCESS'),
                   // .setEmoji('➕'), 
                new MessageButton()
                    .setCustomId('Remove')
                    .setLabel('Remove Server')
                    .setStyle('DANGER'),
                   // .setEmoji('➖'),
            );

        const embed = new MessageEmbed()
            .setTitle("Registered MC Servers")
            .addFields(
                { name: 'Server Name',      value:  serverNameList, inline: true},               // Discord.js v13 requires manual call of toString on all methods
                { name: 'IP',               value:  serverIPList, inline: true},
              )
            .setColor("#8570C1")
            .setFooter(JSON.stringify(Object.values(data.Guilds[guildName].MCData.serverList).length) + ' / 10 Servers Registered')

        await message.reply({ ephemeral: true, embeds: [embed], components: [row]})

        const filter = i => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });
        const command1 = client.commands.get('addmc');
        const command2 = client.commands.get('delmc');

        collector.on('collect', async i => {
            if (i.customId === 'Add') {
                await i.update({ content: 'Adding Server (If Possible)', components: []});
                await command1.execute(client, message, args, guildName);
            }
            else if (i.customId === 'Remove') {
                await i.update({ content: 'Removing Server', components: []});
                await command2.execute(client, message, args, guildName);
            }
        });
        
        collector.on('end', collected => {
            if (collected.size == 1) console.log('button pressed');
            else console.log('no button pressed');
        });
    }
}

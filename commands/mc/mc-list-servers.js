const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const data = require('../../data.json');
const guilds = require("../../schemas/guild-schema");
let cmdStatus = 0;

module.exports = {
    name: 'mc-list-servers',
    description: "Lists registered mc servers from JSON in an embed. No Admin perms required.",
    async execute(client, interaction, guildName) {
        console.log(`mc-list-servers requested by ${interaction.member.user.username}`);

        // prevent multiple instances from running
        if (cmdStatus === 1) { return interaction.editReply('/mc-list-servers command already running.') } // prevent multiple instances from running
        cmdStatus = 1;
        
        // retrieve server doc and list from mongo
        const currentGuild = await guilds.find({guildId: interaction.guildId})
        let serverList = currentGuild[0].MCServerData.serverList
        
        // retrieve server names and IPs
        let serverNameList = [], serverIPList = []
        for (let i = 0; i < serverList.length; i++) {
            serverNameList.push(serverList[i].name)
            serverIPList.push(serverList[i].name)
        }
        
        // ensure list is never empty; embeds cannot receive empty values
        if (serverIPList.length === 0) {   // using server IP List ensures a nameless IP is not overwritten
            serverNameList = "N/A"
            serverIPList = "N/A"
        }

        // generate buttons
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('ListAdd')
                    .setLabel('Add')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('ListRemove')
                    .setLabel('Remove')
                    .setStyle('DANGER'),
                new MessageButton()
                    .setCustomId('ListChange')
                    .setLabel('Change')
                    .setStyle('PRIMARY'),
            );

        // generate embed
        const embed = new MessageEmbed()
            .setTitle("Registered MC Servers")
            .addFields(
                // join(' /n') removes commas and adds newline to array
                { name: 'Server Name', value: serverNameList.join(' \n'), inline: true }, 
                { name: 'IP', value: serverIPList.join(' \n '), inline: true },
            )
            .setColor("#8570C1")
            .setFooter(serverList.length + ' / 10 Servers Registered')

        await interaction.editReply({ ephemeral: true, embeds: [embed], components: [row] })

        // create collector
        const filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON',  time: 10000 }); // only message author can interact, 10s timer 

        // retrieve commands for button
        const command1 = client.commands.get('mc-add-server');
        const command2 = client.commands.get('mc-delete-server');
        const command3 = client.commands.get('mc-change-server');

        // collect response
        collector.on('collect', async i => {
            let update, execute;
            // interaction handling
            if (i.customId === 'ListAdd') {
                update = i.update({ ephemeral: true, embeds: [], content: 'Adding Server (if possible)', components: [] });
                execute = command1.execute(client, interaction, guildName);
                collector.stop()
            }
            else if (i.customId === 'ListRemove') {
                update = i.update({ ephemeral: true, embeds: [], content: 'Removing Server', components: [] });
                execute = command2.execute(client, interaction, guildName);
                collector.stop()
            }
            else if (i.customId === 'ListChange') {
                update = i.update({ ephemeral: true, content: 'Changing Server', components: [] });
                execute = command3.execute(client, interaction, guildName);
                collector.stop()
            }
            await Promise.all([update, execute])
        });

        collector.on('end', async collected => {
            let buttonId = collected.first().customId 
            if (collected.size === 0) 
                await interaction.editReply({ ephemeral: true, embeds: [embed], components: [] }) // remove buttons & embed
            if (buttonId === 'ListAdd' || buttonId === 'ListRemove' || buttonId === 'ListChange') 
                await interaction.editReply({ ephemeral: true, embeds: [], components: [] })   // remove buttons & embed
        });

        cmdStatus = 0;
    }
}

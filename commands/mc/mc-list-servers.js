const { MessageEmbed } = require('discord.js');
const data = require('../../data.json');
let cmdStatus = 0;

module.exports = {
    name: 'mc-list-servers',
    description: "Lists registered mc servers from JSON in an embed. No Admin perms required.",
    async execute(client, interaction, guildName) {
        console.log(`mc-list-servers requested by ${interaction.member.user.username}`);

        // prevent multiple instances from running
        if (cmdStatus === 1) { return interaction.editReply('listmc command already running.') } // prevent multiple instances from running
        cmdStatus = 1;

        let serverList = data.Guilds[guildName].MCData.serverList;

        // retrieve server names and IPs
        let serverNameList = JSON.stringify(Object.keys(serverList), null, 1)
            .replace(/[[\]]/g, '')
            .replace(/[""]/g, '')
            .replace(/[,]/g, '');
        let serverIPList = JSON.stringify(Object.values(serverList), null, 1)
            .replace(/[[\]]/g, '')
            .replace(/[""]/g, '')
            .replace(/[,]/g, '');

        // ensure list is never empty; embeds cannot receive empty values
        if (serverIPList == '') {   // using server IP List ensures a nameless IP is not overwritten
            serverNameList = "N/A"
            serverIPList = "N/A"
        }

        // // generate buttons
        // const row = new MessageActionRow()
        //     .addComponents(
        //         new MessageButton()
        //             .setCustomId('ListAdd')
        //             .setLabel('Add')
        //             .setStyle('SUCCESS'),
        //         new MessageButton()
        //             .setCustomId('ListRemove')
        //             .setLabel('Remove')
        //             .setStyle('DANGER'),
        //         new MessageButton()
        //             .setCustomId('ListChange')
        //             .setLabel('Change')
        //             .setStyle('PRIMARY'),
        //     );

        // generate embed
        const embed = new MessageEmbed()
            .setTitle("Registered MC Servers")
            .addFields(
                { name: 'Server Name', value: serverNameList, inline: true },               // Discord.js v13 requires manual call of toString on all methods
                { name: 'IP', value: serverIPList, inline: true },
            )
            .setColor("#8570C1")
            .setFooter(JSON.stringify(Object.values(serverList).length) + ' / 10 Servers Registered')

        await interaction.editReply({ ephemeral: true, embeds: [embed], components: [] })

        // // create collector
        // const filter = i => i.user.id === interaction.member.user.id;
        // const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', max: 1,  time: 5000 }); // only message author can interact, 5s timer 

        // // retrieve commands for buttons
        // const command1 = client.commands.get('mc-add-server');
        // const command2 = client.commands.get('mc-delete-server');
        // const command3 = client.commands.get('mc-change-server');

        // // collect response
        // collector.on('collect', async i => {
        //     var update, execute;
        //     // interaction handling
        //     if (i.customId === 'ListAdd') {
        //         update = i.update({ content: 'Adding Server (If Possible)', components: [] });
        //         execute = command1.execute(client, interaction, guildName);
        //     }
        //     else if (i.customId === 'ListRemove') {
        //         interaction.editReply({ ephemeral: true, embeds: [] })
        //         update = i.update({ content: 'Removing Server', components: [] });
        //         execute = command2.execute(client, interaction, guildName);
        //     }
        //     else if (i.customId === 'ListChange') {
        //         update = i.update({ content: 'Changing Server', components: [] });
        //         execute = command3.execute(client, interaction, guildName);
        //     }
        //     Promise.all([update, execute])
        // });

        // collector.on('end', async collected => {
        //     let buttonId = collected.first().customId
        //     if (collected.size == 0) 
        //         await interaction.editReply({ ephemeral: true, embeds: [embed], components: [] }) // remove buttons & embed
        //     if (buttonId === 'ListAdd' || buttonId === 'ListRemove' || buttonId === 'ListChange') 
        //         await interaction.editReply({ ephemeral: true, content: 'button selected', embeds: [], components: [] })   // remove buttons & embed
        // });

        // cmdStatus = 0;
    }
}

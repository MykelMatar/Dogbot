const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const data = require('../../data.json');
let cmdStatus = 0;









module.exports = {
    name: 'listmc',
    description: "Lists registered mc servers from JSON in an embed. 4 buttons: 'addmc', 'delmc', 'changemc', 'listmc'. DOES NOT REQUIRE ADMIN PERMS",
    async execute(client, interaction, guildName) {
        console.log(`listmc requested by ${interaction.member.user.username}`);

        // prevent multiple instances from running
        if (cmdStatus == 1) { return interaction.editReply('listmc command already running.') } // prevent multiple instances from running
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
                { name: 'IP', value: serverIPList, inline: true },
            )
            .setColor("#8570C1")
            .setFooter(JSON.stringify(Object.values(serverList).length) + ' / 10 Servers Registered')

        await interaction.editReply({ ephemeral: true, embeds: [embed], components: [row] })

        // create collector
        const filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', max: 1, time: 10000 }); // only message author can interact, 1 response, 10s timer 
        const msgCollector = interaction.channel.createMessageCollector({ time: 10000 })

        // retrieve commands for buttons
        const command1 = client.commands.get('addmc');
        const command2 = client.commands.get('delmc');
        const command3 = client.commands.get('changemc');
        const command4 = client.commands.get('renamemc');

        /** 
         * prevent other button interactions occuring simultaneously 
         * not using preventInteractionCollision because that function rewrites the last sent message to indicate an aborted command.
         * this is not a behavior we want for !mc or !listmc since they display pertinent information
         */
        // msgCollector.on('collect', async m => {
        //     if (m.content == '!mc' || m.content =='!enlist') {
        //         msgCollector.stop();
        //         collector.stop();
        //         await sent.edit({ ephemeral: true, components: [] })
        //     }
        // });

        // collect response
        collector.on('collect', async i => {
            var update, execute;
            // interaction handling
            if (i.customId === 'Add') {
                update = i.update({ content: 'Adding Server (If Possible)', components: [] });
                execute = command1.execute(client, interaction, guildName);
            }
            else if (i.customId === 'Remove') {
                interaction.editReply({ ephemeral: true, embeds: [] })
                update = i.update({ content: 'Removing Server', components: [] });
                execute = command2.execute(client, interaction, guildName);
            }
            else if (i.customId === 'Change') {
                update = i.update({ content: 'Changing Server', components: [] });
                execute = command3.execute(client, interaction, guildName);
            }
            else if (i.customId === 'Rename') {
                update = i.update({ content: 'Renaming Server', components: [] });
                execute = command4.execute(client, interaction, guildName);
            }
            Promise.all([update, execute])
        });

        collector.on('end', async collected => {
            console.log(`listmc collected ${collected.size} button presses`)
            if (collected.size == 0) await interaction.editReply({ ephemeral: true, embeds: [embed], components: [] }) // remove buttons & embed
            if (collected.size == 1) await interaction.editReply({ ephemeral: true, content: 'button selected',embeds: [], components: [] })   // remove buttons & embed
        });

        cmdStatus = 0;
    }
}

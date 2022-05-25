import {Command} from "../../dependencies/classes/Command";
import {MessageActionRow, MessageButton, MessageEmbed} from "discord.js";

export const mcListServers = new Command(
    'mc-list-servers',
    'lists all registered MC server',
    async (client, interaction, guildName?) => {

        const MCServerData = mcListServers.guildData.MCServerData

        // retrieve server names and IPs
        let serverNameList: string[] = [], serverIPList: string[] = []
        for (let i = 0; i < MCServerData.serverList.length; i++) {
            serverNameList.push(MCServerData.serverList[i].name)
            serverIPList.push(MCServerData.serverList[i].ip)
        }

        // ensure list is never empty; embeds cannot receive empty values
        if (serverIPList.length === 0) {   // using server IP List ensures a nameless IP is not overwritten
            serverNameList = ["N/A"]
            serverIPList = ["N/A"]
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
                {name: 'Server Name', value: serverNameList.join(' \n'), inline: true},
                {name: 'IP', value: serverIPList.join(' \n '), inline: true},
            )
            .setColor("#8570C1")
            .setFooter(MCServerData.serverList.length + ' / 10 Servers Registered')

        await interaction.editReply({embeds: [embed], components: [row]})

        // create collector
        const filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'BUTTON',
            time: 10000
        }); // only message author can interact, 10s timer 

        // retrieve commands for button
        const command1 = client.commands.get('mc-add-server');
        const command2 = client.commands.get('mc-delete-server');
        const command3 = client.commands.get('mc-change-server');

        // collect response
        collector.on('collect', async i => {
            let update, execute;
            // interaction handling
            if (i.customId === 'ListAdd') {
                update = i.update({embeds: [], content: 'Adding Server (if possible)', components: []});
                execute = command1.execute(client, interaction, guildName);
                collector.stop()
            } else if (i.customId === 'ListRemove') {
                update = i.update({embeds: [], content: 'Removing Server', components: []});
                execute = command2.execute(client, interaction, guildName);
                collector.stop()
            } else if (i.customId === 'ListChange') {
                update = i.update({content: 'Changing Server', components: []});
                execute = command3.execute(client, interaction, guildName);
                collector.stop()
            }
            await Promise.all([update, execute])
        });

        collector.on('end', async collected => {
            if (collected.size === 0)
                await interaction.editReply({embeds: [embed], components: []}) // remove buttons & embed
            else if (collected.first().customId === 'ListAdd' || collected.first().customId === 'ListRemove' || collected.first().customId === 'ListChange')
                await interaction.editReply({content: 'Button Pressed', embeds: [], components: []})   // remove buttons & embed
        });

    })
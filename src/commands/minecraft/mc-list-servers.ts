import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    CommandInteraction,
    SlashCommandBuilder
} from "discord.js";
import {newClient} from "../../dependencies/myTypes";

//TODO check if it is feasible to get the status of every server on the list
export const mcListServers = {
    data: new SlashCommandBuilder()
        .setName('mc-list-servers')
        .setDescription('Lists all registered MC servers'),

    async execute(client: newClient, interaction: CommandInteraction, guildData, guildName: string) {
        const MCServerData = guildData.MCServerData

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

        let row; // variable amount of buttons to reflect doable actions
        if (serverIPList.length === 10) {
            row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ListRemove')
                        .setLabel('Remove')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('ListChange')
                        .setLabel('Change')
                        .setStyle(ButtonStyle.Primary),
                );
        } else if (serverIPList.length === 1) {
            row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ListAdd')
                        .setLabel('Add')
                        .setStyle(ButtonStyle.Success),
                );
        } else {
            row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ListAdd')
                        .setLabel('Add')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('ListRemove')
                        .setLabel('Remove')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('ListChange')
                        .setLabel('Change')
                        .setStyle(ButtonStyle.Primary),
                );
        }

        // generate embed
        const embed = new EmbedBuilder()
            .setTitle("Registered MC Servers")
            .addFields(
                // join(' /n') removes commas and adds newline to array
                {name: 'Server Name', value: serverNameList.join(' \n'), inline: true},
                {name: 'IP', value: serverIPList.join(' \n '), inline: true},
            )
            .setColor("#8570C1")
            .setFooter({text: MCServerData.serverList.length + ' / 10 Servers Registered'})

        await interaction.editReply({embeds: [embed], components: [row]})

        // create collector
        const filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time: 20000
        }); // only message author can interact, 20s timer 

        // retrieve commands for button
        const command1 = client.commands.get('mc-add-server');
        const command2 = client.commands.get('mc-delete-server');
        const command3 = client.commands.get('mc-change-server');

        try {
            collector.on('collect', async i => {
                let update, execute;
                // interaction handling
                if (i.customId === 'ListAdd') {
                    update = i.update({embeds: [], content: 'Adding Server (if possible)', components: []});
                    execute = command1.execute(client, interaction, guildData, guildName);
                    collector.stop()
                } else if (i.customId === 'ListRemove') {
                    update = i.update({embeds: [], content: 'Removing Server', components: []});
                    execute = command2.execute(client, interaction, guildData, guildName);
                    collector.stop()
                } else if (i.customId === 'ListChange') {
                    update = i.update({content: 'Changing Server', components: []});
                    execute = command3.execute(client, interaction, guildData, guildName);
                    collector.stop()
                }
                await Promise.all([update, execute])
            });
        } catch (e) {
            console.log(e)
        }

        collector.on('end', async collected => {
            if (collected.size === 0)
                await interaction.editReply({embeds: [embed], components: []}) // remove buttons & embed
            else if (collected.first().customId === 'ListAdd' || collected.first().customId === 'ListRemove' || collected.first().customId === 'ListChange')
                await interaction.editReply({content: 'Executing...', embeds: [], components: []})   // remove buttons & embed
        });
    }
}
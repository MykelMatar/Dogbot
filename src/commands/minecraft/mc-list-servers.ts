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
import {log} from "../../dependencies/logger";
import {terminationListener} from "../../dependencies/helpers/terminationListener";
import {status} from "minecraft-server-util";

//TODO check add server button, might not be working
//TODO button collision if same command gets sent more than once
export const mcListServers = {
    data: new SlashCommandBuilder()
        .setName('mc-list-servers')
        .setDescription('Lists all registered MC servers')
        .addBooleanOption(option =>
            option.setName('get-status')
                .setDescription('Retrieves the status of every server on the list. This may take a while...')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display the leaderboard or not')
                .setRequired(false)),

    async execute(client: newClient, interaction: CommandInteraction, guildData, guildName: string) {
        const MCServerData = guildData.MCServerData

        // retrieve server names and IPs
        let serverNameList: string[] = [],
            serverIPList: string[] = [],
            serverStatusList: string[] = []

        let statusOption = interaction.options.data.find(option => option.name === 'get-status')

        for (const MCServer of MCServerData.serverList) {
            serverNameList.push(MCServer.name)
            serverIPList.push(MCServer.ip)
            if (statusOption != undefined) {
                await status(MCServer.ip, MCServer.port, {timeout: 2000})
                    .then(() => {
                        serverStatusList.push('*Online*')
                    })
                    .catch(() => {
                        serverStatusList.push('*Offline*')
                    })
            }
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
            .setTitle('Registered MC Servers')
            .addFields(
                // join(' /n') removes commas and adds newline to array
                {name: 'Server Name', value: serverNameList.join(' \n'), inline: true},
                {name: 'IP', value: serverIPList.join(' \n '), inline: true},
            )
            .setColor('#B8CAD1')
            .setFooter({text: MCServerData.serverList.length + ' / 10 Servers Registered'})

        if (statusOption != undefined) {
            embed.addFields({name: 'Status', value: serverStatusList.join(' \n '), inline: true})
        }

        await interaction.editReply({embeds: [embed], components: [row]})

        // create collector
        const filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time: 20000
        });

        // retrieve commands for button
        const command1 = client.commands.get('mc-add-server');
        const command2 = client.commands.get('mc-delete-server');
        const command3 = client.commands.get('mc-change-server');

        try {
            collector.on('collect', async i => {
                let update, execute;
                // interaction handling
                if (i.customId === 'ListAdd') {
                    update = i.update({embeds: [], content: '*Adding Server...*', components: []});
                    execute = command1.execute(client, interaction, guildData, guildName);
                    collector.stop()
                } else if (i.customId === 'ListRemove') {
                    update = i.update({embeds: [], content: '*Removing Server...*', components: []});
                    execute = command2.execute(client, interaction, guildData, guildName);
                    collector.stop()
                } else if (i.customId === 'ListChange') {
                    update = i.update({content: '*Changing Server...*', components: []});
                    execute = command3.execute(client, interaction, guildData, guildName);
                    collector.stop()
                }
                await Promise.all([update, execute])
            });

            collector.on('end', async collected => {
                if (collected.size === 0)
                    await interaction.editReply({embeds: [embed], components: []}) // remove buttons & embed
                else if (collected.first().customId === 'ListAdd' || collected.first().customId === 'ListRemove' || collected.first().customId === 'ListChange')
                    await interaction.editReply({embeds: [], components: []})   // remove buttons & embed
            });

            let terminate: boolean = false
            await terminationListener(client, collector, terminate)
        } catch (e) {
            log.error(e)
            await interaction.editReply({content: 'Refrain from using the same command multiple times'})
        }
    }
}
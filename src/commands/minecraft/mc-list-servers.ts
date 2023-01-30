import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    CommandInteractionOption,
    ComponentType,
    EmbedBuilder,
    Message,
    SlashCommandBuilder
} from "discord.js";
import {embedColor, GuildSchema, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {terminate, terminationListener} from "../../dependencies/helpers/terminationListener";
import {status} from "minecraft-server-util";

//TODO check add server button, might not be working
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

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema, guildName: string) {
        const MCServerData = guildData.MCServerData
        let serverNameList: string[] = [],
            serverIPList: string[] = [],
            serverStatusList: string[] = []
        let statusOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'get-status')

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

        const embed = new EmbedBuilder()
            .setTitle('Registered MC Servers')
            .addFields(
                {name: 'Server Name', value: serverNameList.join(' \n'), inline: true},
                {name: 'IP', value: serverIPList.join(' \n '), inline: true},
            )
            .setColor(embedColor)
            .setFooter({text: MCServerData.serverList.length + ' / 10 Servers Registered'})

        if (statusOption != undefined) {
            embed.addFields({name: 'Status', value: serverStatusList.join(' \n '), inline: true})
        }

        let sent: Message = await interaction.editReply({embeds: [embed], components: [row]})

        const filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time: 20000
        });
        let terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)
        
        try {
            const command1 = client.commands.get('mc-add-server');
            const command2 = client.commands.get('mc-delete-server');
            const command3 = client.commands.get('mc-change-server');
            collector.on('collect', async i => {
                if (i.message.id != sent.id) return
                let update, execute;
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
                process.removeListener('SIGINT', terminateBound)
                if (collected.size === 0)
                    await interaction.editReply({embeds: [embed], components: []}) // remove buttons & embed
                else if (collected.first().customId === 'ListAdd' || collected.first().customId === 'ListRemove' || collected.first().customId === 'ListChange')
                    await interaction.editReply({embeds: [], components: []})   // remove buttons & embed
            });
        } catch (e) {
            log.error(e)
            await interaction.editReply({content: 'Refrain from using the same command multiple times'})
        }
    }
}
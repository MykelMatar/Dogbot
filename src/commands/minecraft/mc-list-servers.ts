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
import {embedColor, IGuild, NewClient} from "../../dependencies/myTypes";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/terminationListener";
import {mcListServersGetStatus} from "../../dependencies/helpers/mcListServersGetStatus";

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

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        const MCServerData = guildData.mcServerData

        let serverStatusList: string[] = []
        let {value: getStatus} = (interaction.options.data.find(option => option.name === 'get-status') ?? {}) as CommandInteractionOption

        let serverNameList: string[] = MCServerData.serverList.map(server => server.name);
        let serverIPList: string[] = MCServerData.serverList.map(server => server.ip);

        let selectedNameIndex = serverNameList.findIndex(name => name == MCServerData.selectedServer.name)
        let selectedIpIndex = serverIPList.findIndex(ip => ip == MCServerData.selectedServer.ip)
        serverNameList[selectedNameIndex] = `**${serverNameList[selectedNameIndex]}**`
        serverIPList[selectedIpIndex] = `**${serverIPList[selectedIpIndex]}**`

        if (serverIPList.length === 0) { // using server IP List ensures a nameless IP is not overwritten
            serverNameList = ["N/A"]
            serverIPList = ["N/A"]
        }

        let row; // variable amount of buttons to reflect doable actions
        if (serverIPList.length === 1) {
            row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ListStatus')
                        .setLabel('Status')
                        .setStyle(ButtonStyle.Success),
                );
        } else {
            row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ListStatus')
                        .setLabel('Status')
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

        if (getStatus) {
            serverStatusList = await mcListServersGetStatus(MCServerData);
            embed.addFields({name: 'Status', value: serverStatusList.join(' \n '), inline: true})
        }

        const sent: Message = await interaction.editReply({embeds: [embed], components: [row]})

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 120000,
            filter: (i) => {
                if (i.user.id !== interaction.member.user.id) return false;
                return i.message.id === sent.id;
            },
        });
        const terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)

        collector.on('collect', async i => {
            let update, execute;
            switch (i.customId) {
                case 'ListRemove':
                    update = i.update({embeds: [], content: '*Removing Server...*', components: []});
                    execute = client.commands.get('mc-delete-server').execute(client, interaction, guildData);
                    break;
                case 'ListChange':
                    update = i.update({content: '*Changing Server...*'});
                    execute = client.commands.get('mc-change-server').execute(client, interaction, guildData);
                    break;
                case 'ListStatus':
                    serverStatusList = await mcListServersGetStatus(MCServerData);
                    embed.addFields({name: 'Status', value: serverStatusList.join(' \n '), inline: true})
                    await interaction.editReply({embeds: [embed]})
                    break;
                default:
                    return;
            }
            await Promise.all([update, execute])
        });

        collector.on('end', async collected => {
            removeTerminationListener(terminateBound)
            if (collected.size === 0) {
                await interaction.editReply({components: []})
            } else if (['ListStatus', 'ListRemove', 'ListChange'].includes(collected.first().customId)) {
                await interaction.editReply({embeds: [embed], components: []})
            }
        });

    }
}
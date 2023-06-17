import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    CommandInteractionOptionResolver,
    ComponentType,
    EmbedBuilder,
    Message,
    SlashCommandBuilder
} from "discord.js";
import {CustomClient, embedColor, MongoGuild, SlashCommand} from "../../dependencies/myTypes";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/otherHelpers/terminationListener";
import {checkListServerStatus} from "../../dependencies/helpers/mcHelpers/checkListServerStatus";

export const mcListServers: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('mc-list-servers')
        .setDescription('Lists all registered minecraft servers')
        .addBooleanOption(option =>
            option.setName('get-status')
                .setDescription('Retrieves the status of every server on the list. This may take a while...')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display the leaderboard or not')
                .setRequired(false)),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {
        const MCServerData = guildData.mcServerData

        let serverStatusList: string[] = []
        const options = interaction.options as CommandInteractionOptionResolver // ts thinks the .get options dont exist
        const getStatus = options.getBoolean('game')

        let serverNameList: string[] = MCServerData.serverList.map(server => server.name);
        let serverIPList: string[] = MCServerData.serverList.map(server => server.ip);

        const selectedNameIndex = serverNameList.findIndex(name => name == MCServerData.selectedServer.name)
        const selectedIpIndex = serverIPList.findIndex(ip => ip == MCServerData.selectedServer.ip)
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
                        .setLabel('Status')
                        .setCustomId('listStatus')
                        .setStyle(ButtonStyle.Success),
                );
        } else {
            row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Status')
                        .setCustomId('listStatus')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setLabel('Remove')
                        .setCustomId('listRemove')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setLabel('Change')
                        .setCustomId('listChange')
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
            .setFooter({text: `${MCServerData.serverList.length} / 10 Servers Registered`})

        if (getStatus) {
            serverStatusList = await checkListServerStatus(MCServerData);
            embed.addFields({name: 'Status', value: serverStatusList.join(' \n '), inline: true})
        }

        const sent: Message = await interaction.editReply({embeds: [embed], components: [row]})

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 600000,
            filter: (i) => {
                if (i.user.id !== interaction.member.user.id) return false;
                return i.message.id === sent.id;
            },
        });
        const terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)

        let gettingStatus = false

        collector.on('collect', async i => {
            switch (i.customId) {
                case 'ListRemove':
                    await client.commands.get('mc-delete-server').execute(client, interaction, guildData);
                    break;
                case 'ListChange':
                    await client.commands.get('mc-select-server').execute(client, interaction, guildData);
                    break;
                case 'ListStatus':
                    i.deferUpdate()

                    if (gettingStatus) break;
                    gettingStatus = true;

                    serverStatusList = await checkListServerStatus(MCServerData);
                    embed.addFields({name: 'Status', value: serverStatusList.join(' \n '), inline: true})

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

                    await interaction.editReply({embeds: [embed], components: [row]})
                    break;
                default:
                    return;
            }
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
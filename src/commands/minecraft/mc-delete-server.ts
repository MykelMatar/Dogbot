import {
    ActionRowBuilder,
    CommandInteraction,
    ComponentType,
    Message,
    PermissionFlagsBits,
    SelectMenuBuilder,
    SlashCommandBuilder
} from "discord.js";
import {McMenuOptionGenerator} from "../../dependencies/helpers/mcMenuOptionGenerator";
import {DiscordMenuGeneratorReturnValues, GuildSchema, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/terminationListener";


export const mcDeleteServer = {
    data: new SlashCommandBuilder()
        .setName('mc-delete-server')
        .setDescription('Deletes a registered MC server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema, guildName: string) {
        const MCServerData = guildData.MCServerData
        let serverListSize: number = MCServerData.serverList.length
        if (serverListSize === 0) {
            return await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
        }
        if (serverListSize === 1) {
            return await interaction.editReply(
                `Cannot remove the only existing server, use /mc-add-server or /mc-list-servers to add servers, or change server information with /mc-change-server-name and /mc-change-server-ip.`
            )
        }

        let optionGenerator: DiscordMenuGeneratorReturnValues = await McMenuOptionGenerator(interaction, guildName, serverListSize);
        const row = new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('delete-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(optionGenerator.optionsArray),
            );

        let sent: Message = await interaction.editReply({content: 'Select a Server to Delete', components: [row]});

        const filter = i => {
            if (i.user.id !== interaction.member.user.id) return false;
            return i.message.id === sent.id;
        };

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.SelectMenu,
            time: 15000,
            max: 1,
            filter: (i) => {
                if (i.user.id !== interaction.member.user.id) return false;
                return i.message.id === sent.id;
            },
        });

        let terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)

        let serverName;
        try {
            collector.on('collect', async i => {
                const selectedServerIP = i.values[0]
                const selectedServer = MCServerData.serverList.find(server => {
                    return server.ip === selectedServerIP
                })

                if (selectedServer) {
                    const selectedIndex = MCServerData.serverList.indexOf(selectedServer);
                    serverName = selectedServer.name
                    if (selectedIndex !== -1) {
                        MCServerData.serverList.splice(selectedIndex, 1);
                    }
                }

                // this works because you cannot delete the only existing server, which means [0] will always exist
                if (selectedServerIP === selectedServer.ip) {
                    MCServerData.selectedServer.ip = MCServerData.serverList[0].ip
                    MCServerData.selectedServer.port = MCServerData.serverList[0].port
                    MCServerData.selectedServer.name = MCServerData.serverList[0].name
                }
                await guildData.save()
            });
        } catch (e) {
            log.error(e)
        }

        collector.on('end', async collected => {
            removeTerminationListener(terminateBound)
            if (collected.size === 0) {
                await interaction.editReply({content: '*Request Timeout*', components: []});
                log.error('Request Timeout')
            } else if (collected.first().customId === 'delete-menu') {
                await interaction.editReply({content: `**${serverName}** deleted`, components: []});
                log.info('Server Deleted Successfully')
            }
        });
    }
}
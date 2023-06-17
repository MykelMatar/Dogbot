import {
    ActionRowBuilder,
    APISelectMenuOption,
    CommandInteraction,
    ComponentType,
    Message,
    PermissionFlagsBits,
    SlashCommandBuilder,
    StringSelectMenuBuilder
} from "discord.js";
import {selectMenuOptionGenerator} from "../../dependencies/helpers/mcHelpers/selectMenuOptionGenerator";
import {CustomClient, MinecraftServer, MongoGuild, SlashCommand} from "../../dependencies/myTypes";
import log from "../../dependencies/constants/logger";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/otherHelpers/terminationListener";
import {createMcCommandCollector} from "../../dependencies/helpers/mcHelpers/createMcCommandCollector";


export const mcDeleteServer: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('mc-delete-server')
        .setDescription('Deletes a registered MC server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {
        const MCServerData = guildData.mcServerData
        const serverList: MinecraftServer[] = MCServerData.serverList
        const serverListSize: number = MCServerData.serverList.length

        if (serverListSize === 0) {
            return await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
        }
        if (serverListSize === 1) {
            return await interaction.editReply(
                `Cannot remove the only existing server, use /mc-add-server to add servers, or change server information with /mc-change-name and /mc-change-ip.`
            )
        }

        const menuOptions: APISelectMenuOption[] = await selectMenuOptionGenerator(interaction, serverList);
        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('deleteSelectMenu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(menuOptions),
            );

        const sent: Message = await interaction.editReply({content: 'Select a Server to Delete', components: [row]});

        const collector = createMcCommandCollector(interaction, sent, ['deleteSelectMenu'])
        const terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)

        let serverName;
        collector.on('collect', async i => {
            const selectedServerIP = i.values[0]
            const selectedServer = serverList.find(server => server.ip === selectedServerIP)

            if (selectedServer) {
                const selectedIndex = serverList.indexOf(selectedServer);
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


        collector.on('end', async collected => {
            removeTerminationListener(terminateBound)
            if (collected.size === 0) {
                await interaction.editReply({content: '*Request Timeout*', components: []});
                log.error('Request Timeout')
            } else if (collected.first().customId === 'deleteSelectMenu') {
                await interaction.editReply({content: `**${serverName}** deleted`, components: []});
                log.info('Server Deleted Successfully')
            }
        });
    }
}
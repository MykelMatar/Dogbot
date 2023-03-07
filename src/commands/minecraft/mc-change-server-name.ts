import {
    ActionRowBuilder,
    APISelectMenuOption,
    CommandInteraction,
    ComponentType,
    Message,
    PermissionFlagsBits,
    SelectMenuBuilder,
    SlashCommandBuilder
} from "discord.js";
import {McMenuOptionGenerator} from "../../dependencies/helpers/mcMenuOptionGenerator";
import {GuildSchema, MinecraftServer, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/terminationListener";
import {createMcCommandCollector} from "../../dependencies/helpers/createMcCommandCollector";

export const mcChangeServerName = {
    data: new SlashCommandBuilder()
        .setName('mc-change-server-name')
        .setDescription('Renames an existing server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('new-name')
                .setDescription('The new server name')
                .setMaxLength(30)
                .setRequired(true)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema) {
        const MCServerData = guildData.MCServerData
        let serverList: MinecraftServer[] = MCServerData.serverList
        let serverListSize: number = MCServerData.serverList.length
        if (serverListSize === 0) {
            await interaction.editReply('*No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.*')
            return
        }

        let newName = interaction.options.data[0].value as string

        // verify that name is not already registered under a different IP
        if (MCServerData.serverList.some(server => server.name === newName)) {
            await interaction.editReply(
                "Cannot have duplicate server names, please choose a different name or use /mc-change-server-ip to change the IP of the existing server"
            );
            return log.error("Duplicate Name Detected");
        }

        let menuOptions: APISelectMenuOption[] = await McMenuOptionGenerator(interaction, serverList);
        let row = new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('change-server-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(menuOptions),
            );

        let sent: Message = await interaction.editReply({
            content: 'Select the server you want to rename',
            components: [row]
        });

        const collector = createMcCommandCollector(interaction, sent)
        let terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)

        let selectedServerName
        collector.on('collect', async i => {
            const selectedServerIP = i.values[0]
            const selectedServer = MCServerData.serverList.find(server => {
                return server.ip === selectedServerIP
            })
            let selectedServerName = selectedServer.name
            selectedServer.name = newName

            if (MCServerData.selectedServer.name === selectedServerName) {
                MCServerData.selectedServer.name = newName
            }
            await guildData.save()
            collector.stop()
        });

        collector.on('end', async collected => {
            removeTerminationListener(terminateBound)
            if (collected.size === 0) {
                await interaction.editReply({content: '*Request Timeout*', components: []});
                log.error('Request Timeout')
            } else if (collected.first().customId === 'change-server-menu') {
                await interaction.editReply({
                    content: ` **${selectedServerName}** renamed successfully to **${newName}**`, components: []
                })
                log.info('Server Renamed Successfully')
            }
        });
    }
}
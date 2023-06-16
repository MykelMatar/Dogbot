import {
    ActionRowBuilder,
    APISelectMenuOption,
    CommandInteraction,
    CommandInteractionOptionResolver,
    ComponentType,
    Message,
    PermissionFlagsBits,
    SlashCommandBuilder,
    StringSelectMenuBuilder
} from "discord.js";
import {selectMenuOptionGenerator} from "../../dependencies/helpers/mcHelpers/selectMenuOptionGenerator";
import {IGuild, MinecraftServer, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/constants/logger";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/otherHelpers/terminationListener";
import {createMcCommandCollector} from "../../dependencies/helpers/mcHelpers/createMcCommandCollector";

export const mcChangeName = {
    data: new SlashCommandBuilder()
        .setName('mc-change-name')
        .setDescription('Renames a minecraft server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('new-name')
                .setDescription('The new server name')
                .setMaxLength(30)
                .setRequired(true)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        const MCServerData = guildData.mcServerData
        const serverList: MinecraftServer[] = MCServerData.serverList
        const serverListSize: number = MCServerData.serverList.length

        if (serverListSize === 0) {
            return interaction.editReply('*No Registered Servers, use /mc-add-server to add servers.*')
        }

        const options = interaction.options as CommandInteractionOptionResolver
        const newName = options.getString('new-name', true)

        // verify that name is not already registered under a different IP
        if (MCServerData.serverList.some(server => server.name === newName)) {
            await interaction.editReply(
                "Cannot have duplicate server names, please choose a different name or use /mc-change-server-ip to change the IP of the existing server"
            );
            return log.error("Duplicate Name Detected");
        }

        const menuOptions: APISelectMenuOption[] = await selectMenuOptionGenerator(interaction, serverList);
        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('changeServerMenu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(menuOptions),
            );

        const sent: Message = await interaction.editReply({
            content: 'Select the server you want to rename',
            components: [row]
        });

        const collector = createMcCommandCollector(interaction, sent, ['changeServerMenu'])
        const terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)

        let selectedServerName
        collector.on('collect', async i => {
            const selectedServerIP = i.values[0]
            const selectedServer = MCServerData.serverList.find(server => {
                return server.ip === selectedServerIP
            })
            selectedServerName = selectedServer.name
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
                log.warn('Request Timeout')
            } else if (collected.first().customId === 'changeServerMenu') {
                await interaction.editReply({
                    content: ` **${selectedServerName}** renamed successfully to **${newName}**`, components: []
                })
                log.info('Server Renamed Successfully')
            }
        });
    }
}
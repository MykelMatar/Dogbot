import {McMenuOptionGenerator} from "../../dependencies/helpers/mcMenuOptionGenerator";
import {
    ActionRowBuilder,
    APISelectMenuOption,
    CommandInteraction,
    ComponentType,
    Message,
    SlashCommandBuilder,
    StringSelectMenuBuilder
} from "discord.js";
import {IGuild, MinecraftServer, NewClient} from "../../dependencies/myTypes";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/terminationListener";
import {createMcCommandCollector} from "../../dependencies/helpers/createMcCommandCollector";

export const mcSelectServer = {
    data: new SlashCommandBuilder()
        .setName('mc-select-server')
        .setDescription('changes the server being tracked by mc-status'),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        const MCServerData = guildData.mcServerData
        let serverList: MinecraftServer[] = MCServerData.serverList
        let serverListSize: number = MCServerData.serverList.length

        if (serverListSize === 0) {
            await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
            return;
        } else if (serverListSize === 1) {
            await interaction.editReply('Only 1 Registered Server, use /mc-add-server or /mc-list-servers to add more servers.')
            return;
        }

        let menuOptions: APISelectMenuOption[] = await McMenuOptionGenerator(interaction, serverList);

        let row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('change-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(menuOptions),
            );

        let sent: Message = await interaction.editReply({
            content: 'Select a Different Server to Check',
            components: [row]
        });

        const collector = createMcCommandCollector(interaction, sent)
        let terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)

        collector.on('collect', async i => {
            const selectedServerIP = i.values[0]
            const selectedServer = MCServerData.serverList.find(server => {
                return server.ip === selectedServerIP
            })
            MCServerData.selectedServer.name = selectedServer.name;
            MCServerData.selectedServer.ip = selectedServer.ip;
            MCServerData.selectedServer.port = selectedServer.port

            await guildData.save()
        });

        collector.on('end', async collected => {
            removeTerminationListener(terminateBound)
            if (collected.size === 0) {
                await interaction.editReply({content: 'Request Timeout', components: []})
            } else if (collected.first().customId === 'change-menu') {
                await interaction.editReply({
                    content: `Now tracking **${MCServerData.selectedServer.name}**. Retrieving server status...`,
                    components: []
                })
                await client.commands.get('mc-status').execute(client, interaction, guildData);
            }
        });
    }
}
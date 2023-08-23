import {selectMenuOptionGenerator} from "../../dependencies/helpers/mcHelpers/selectMenuOptionGenerator";
import {
    ActionRowBuilder,
    APISelectMenuOption,
    CommandInteraction,
    ComponentType,
    Message,
    SlashCommandBuilder,
    StringSelectMenuBuilder
} from "discord.js";
import {CustomClient, MinecraftServer, MongoGuild, SlashCommand} from "../../dependencies/myTypes";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/otherHelpers/terminationListener";
import {createMcCommandCollector} from "../../dependencies/helpers/mcHelpers/createMcCommandCollector";
import messageStillExists from "../../dependencies/helpers/otherHelpers/messageStillExists";

export const mcSelectServer: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('mc-select-server')
        .setDescription('changes the server being tracked by mc-status'),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {
        const MCServerData = guildData.mcServerData
        const serverList: MinecraftServer[] = MCServerData.serverList
        const serverListSize: number = MCServerData.serverList.length

        if (serverListSize === 0) {
            await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
            return;
        } else if (serverListSize === 1) {
            await interaction.editReply('Only 1 Registered Server, use /mc-add-server or /mc-list-servers to add more servers.')
            return;
        }

        const menuOptions: APISelectMenuOption[] = await selectMenuOptionGenerator(interaction, serverList);
        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('changeSelectMenu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(menuOptions),
            );

        const sent: Message = await interaction.editReply({
            content: 'Select a Different Server to Check',
            components: [row]
        });

        const collector = createMcCommandCollector(interaction, sent, ['changeSelectMenu'])
        const terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)

        collector.on('collect', async i => {
            const selectedServerIP = i.values[0]
            const selectedServer = MCServerData.serverList.find(server => server.ip === selectedServerIP)

            MCServerData.selectedServer.name = selectedServer.name;
            MCServerData.selectedServer.ip = selectedServer.ip;
            MCServerData.selectedServer.port = selectedServer.port

            await guildData.save()
        });

        collector.on('end', async collected => {
            removeTerminationListener(terminateBound)
            if (!(await messageStillExists(sent))) return
            if (collected.size === 0) {
                await interaction.editReply({content: 'Request Timeout', components: []})
            } else if (collected.first().customId === 'changeSelectMenu') {
                await interaction.editReply({
                    content: `Now tracking **${MCServerData.selectedServer.name}**. Retrieving server status...`,
                    components: []
                })
                await client.commands.get('mc-status').execute(client, interaction, guildData);
            }
        });
    }
}
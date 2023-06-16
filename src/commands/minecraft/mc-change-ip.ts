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
import {status} from "minecraft-server-util";
import {selectMenuOptionGenerator} from "../../dependencies/helpers/mcHelpers/selectMenuOptionGenerator";
import {IGuild, MinecraftServer, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/constants/logger";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/otherHelpers/terminationListener";
import {createMcCommandCollector} from "../../dependencies/helpers/mcHelpers/createMcCommandCollector";

export const mcChangeIp = {
    data: new SlashCommandBuilder()
        .setName('mc-change-ip')
        .setDescription('Changes the IP address of a server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('new-ip')
                .setDescription('the new IP address')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('new-port')
                .setDescription('the new port')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        const MCServerData = guildData.mcServerData
        let serverList: MinecraftServer[] = MCServerData.serverList
        let serverListSize: number = MCServerData.serverList.length

        if (serverListSize === 0) {
            await interaction.editReply('*No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.*')
            return;
        }

        const options = interaction.options as CommandInteractionOptionResolver;
        const port = options.getInteger('port') ?? 25565

        let newServer: MinecraftServer = {
            name: undefined,
            ip: options.getString('ip'),
            port: port
        };

        // verify that IP is not already registered
        if (MCServerData.serverList.some(server => server.ip === newServer.ip)) {
            await interaction.editReply(
                "Server already registered, double check the IP or use **mc-change-name** to change the name of an existing server"
            );
            return log.warn("Duplicate IP Detected");
        }

        // validate server status
        try {
            await status(newServer.ip, newServer.port)
        } catch {
            await interaction.editReply('Could not retrieve server status. Double check IP and make sure server is online.')
            log.warn('Invalid Server IP / Server Offline');
        }

        // create variables and generate options for select menu
        let menuOptions: APISelectMenuOption[] = await selectMenuOptionGenerator(interaction, serverList);
        let row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('changeIPMenu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(menuOptions),
            );

        const sent: Message = await interaction.editReply({
            content: 'Select the server you want to change the IP of',
            components: [row]
        });

        const collector = createMcCommandCollector(interaction, sent, ['changeIPMenu'])
        const terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)

        let selectedServerName;
        collector.on('collect', async i => {
            const selectedServerIP = i.values[0]
            const selectedServer = MCServerData.serverList.find(server => {
                return server.ip === selectedServerIP
            })
            selectedServer.ip = newServer.ip
            selectedServer.port = newServer.port
            selectedServerName = selectedServer.name

            await guildData.save()
        });

        collector.on('end', async collected => {
            removeTerminationListener(terminateBound)
            if (collected.size === 0) {
                await interaction.editReply({content: 'Request Timeout', components: []});
                log.warn('Request Timeout')
            } else if (collected.first().customId === 'changeIPMenu') {
                await interaction.editReply({
                    content: `**${selectedServerName}** IP changed successfully`,
                    components: []
                });
                log.info('Server IP changed Successfully')
            }
        });
    }
}

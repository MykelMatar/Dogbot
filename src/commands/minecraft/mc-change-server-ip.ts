import {
    ActionRowBuilder,
    APISelectMenuOption,
    CommandInteraction,
    CommandInteractionOption,
    ComponentType,
    Message,
    PermissionFlagsBits,
    SlashCommandBuilder,
    StringSelectMenuBuilder
} from "discord.js";
import {status} from "minecraft-server-util";
import {McMenuOptionGenerator} from "../../dependencies/helpers/mcMenuOptionGenerator";
import {IGuild, MinecraftServer, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/terminationListener";
import {createMcCommandCollector} from "../../dependencies/helpers/createMcCommandCollector";

export const mcChangeServerIP = {
    data: new SlashCommandBuilder()
        .setName('mc-change-server-ip')
        .setDescription('Changes the IP address of an existing server')
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

        let {value: port = 25565} = ((interaction.options.data.find(option => option.name === 'port')) ?? {}) as CommandInteractionOption;

        let newServer: MinecraftServer = {
            name: undefined,
            ip: interaction.options.data[0].value as string,
            port: port as number
        };

        // verify that IP is not already registered
        if (MCServerData.serverList.some(server => server.ip === newServer.ip)) {
            await interaction.editReply(
                "Server already registered, double check the IP or use **mc-change-server-name** to change the name of an existing server"
            );
            return log.error("Duplicate IP Detected");
        }

        // validate server status
        try {
            await status(newServer.ip, newServer.port)
        } catch (error) {
            await interaction.editReply('Could not retrieve server status. Double check IP and make sure server is online.')
            log.error('Invalid Server IP / Server Offline');
        }

        // create variables and generate options for select menu
        let menuOptions: APISelectMenuOption[] = await McMenuOptionGenerator(interaction, serverList);
        let row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('change-ip-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(menuOptions),
            );

        let sent: Message = await interaction.editReply({
            content: 'Select the server you want to change the IP of',
            components: [row]
        });

        const collector = createMcCommandCollector(interaction, sent)
        let terminateBound = terminate.bind(null, client, collector)
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
                log.error('Request Timeout')
            } else if (collected.first().customId === 'change-ip-menu') {
                await interaction.editReply({
                    content: `**${selectedServerName}** IP changed successfully`,
                    components: []
                });
                log.info('Server IP changed Successfully')
            }
        });
    }
}

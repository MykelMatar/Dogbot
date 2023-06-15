import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextInputStyle
} from "discord.js";
import {status, statusBedrock} from 'minecraft-server-util'
import {IGuild, MinecraftServer, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/constants/logger";

export const mcAddServer = {
    data: new SlashCommandBuilder()
        .setName('mc-add-server')
        .setDescription('Adds a new minecraft server to the server list. Server must be online. ')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('IP of your server. MAKE SURE THE SERVER IS ONLINE')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('name of the server. Can be changed later via /mc-change-server-name')
                .setRequired(true)
                .setMaxLength(30))
        .addIntegerOption(option =>
            option.setName('port')
                .setDescription('Port of your server.')
                .setRequired(false)
                .setMaxValue(65535)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        const serverList: MinecraftServer[] = guildData.mcServerData.serverList
        if (serverList.length === 10) {
            return interaction.editReply("Max number of servers reached (Limit of **10**).");
        }

        const options = interaction.options as CommandInteractionOptionResolver;
        const ip = options.getString('ip');
        const name = options.getString('name');
        const port = options.getInteger('port') ?? 25565;

        if (serverList.some(server => server.ip === ip)) {
            await interaction.editReply(
                {content: "Duplicate IP found. Check servers using /mc-list-servers or use /mc-change-name to change its name"}
            );
            return log.warn("Duplicate IP Detected");
        }

        let newServer: MinecraftServer = {
            name: name,
            ip: ip,
            port: port
        };

        // make sure IP is a valid server IP by checking its status (server must be online for this to work)
        let validServer = true
        try {
            await status(newServer.ip, newServer.port);
        } catch {
            try {
                await statusBedrock(newServer.ip, newServer.port);
            } catch {
                validServer = false;
                log.warn('Invalid server / server offline')
                await interaction.editReply(
                    {content: "Could not retrieve server status. Double check IP and make sure server is online."}
                );
            }
        }

        if (!validServer) return;
        if (serverList.length === 0) {
            const {ip, port, name} = newServer;
            guildData.mcServerData.selectedServer = {ip, port, name} // assuming you have variables named ip, port, and name that correspond to mcServer.ip, mcServer.port, and mcServer.name
        }
        serverList.push(newServer);

        const saveData = guildData.save()
        const editReply = interaction.editReply({content: "Server added successfully"})
        const getStatus = client.commands.get('mc-status').execute(client, interaction, guildData)
        await Promise.all([saveData, editReply, getStatus]);
    }
}

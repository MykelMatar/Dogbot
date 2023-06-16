import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextInputStyle
} from "discord.js";
import {IGuild, MinecraftServer, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/constants/logger";
import {checkServerStatus} from "../../dependencies/helpers/mcHelpers/checkServerStatus";

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

        let newServer: MinecraftServer = {
            name: options.getString('name'),
            ip: options.getString('ip'),
            port: options.getInteger('port') ?? 25565
        };

        if (serverList.some(server => server.ip === newServer.ip)) {
            await interaction.editReply(
                {content: 'Duplicate IP found. Check servers using /mc-list-servers or use /mc-change-name to change its name'}
            );
            return log.warn('Duplicate IP Detected');
        }

        // make sure IP is a valid server IP by checking its status (server must be online for this to work)
        let validServer = await checkServerStatus(newServer)

        if (!validServer) {
            await interaction.editReply(
                {content: "Could not retrieve server status. Double check IP and make sure server is online."}
            );
            return
        }

        if (serverList.length === 0) {
            const {ip, port, name} = newServer;
            guildData.mcServerData.selectedServer = {ip, port, name}
        }
        serverList.push(newServer);

        const saveData = guildData.save()
        const editReply = interaction.editReply({content: "Server added successfully"})
        const getStatus = client.commands.get('mc-status').execute(client, interaction, guildData)
        
        await Promise.all([saveData, editReply, getStatus]);
    }
}

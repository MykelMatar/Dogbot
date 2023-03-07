import {CommandInteraction, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {status} from 'minecraft-server-util'
import {McAddServerInteraction} from "../../dependencies/helpers/mcAddServerInteraction"
import {GuildSchema, MinecraftServer, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";

export const mcAddServer = {
    data: new SlashCommandBuilder()
        .setName('mc-add-server')
        .setDescription('Adds a new IP to the server list in Mongo')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('IP of your server. MAKE SURE THE SERVER IS ONLINE')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('name of the server. Can be changed later via mc-change-server-name')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('port')
                .setDescription('Port of your server.')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema) {
        const serverList: MinecraftServer[] = guildData.MCServerData.serverList
        if (serverList.length === 10) {
            await interaction.editReply("Max number of servers reached (Limit of 10).");
            return
        }

        let newServer: MinecraftServer = {
            name: undefined,
            ip: undefined,
            port: undefined
        };

        try { // if slash command is used
            newServer.ip = interaction.options.data[0].value as string;
            newServer.name = interaction.options.data[1].value as string;
            const portOption = interaction.options.data.find(option => option.name === 'port');
            newServer.port = portOption?.value as number ?? 25565;
        } catch { // if button on /mc-list-servers is used
            newServer.ip = await McAddServerInteraction(interaction, "Input server IP (server must be online)", "Request Timeout") as string;
            if (newServer.ip == null) return await interaction.editReply('Invalid Server IP');
            newServer.name = await McAddServerInteraction(interaction, "Input Name", "Request Timeout") as string;
            if (newServer.name.toString().length > 30) {
                return await interaction.editReply('Please keep server name below 30 characters')
            }
            if (newServer.name.toString().length < 1) {
                return await interaction.editReply('Invalid server name input. ')
            }
            newServer.port = await McAddServerInteraction(interaction, "Input Server Port. If you are not sure, the default is 25565.", "Request Timeout") as number;
            // not using Promise.all bc 1 response must be collected before the other / not simultaneous
        }

        if (serverList.some(server => server.ip === newServer.ip)) {
            await interaction.editReply(
                "Server already registered, double check the IP or use /mc-change-server-name to change its name"
            );
            return log.error("Duplicate IP Detected");
        }

        // make sure IP is a valid server IP by checking its status (server must be online for this to work)
        try {
            await status(newServer.ip, newServer.port);
            // if server is the first added server, make it the selected server to track in /mc-server-status
            if (serverList.length === 0) {
                const {ip, port, name} = newServer;
                guildData.MCServerData.selectedServer = {ip, port, name} // assuming you have variables named ip, port, and name that correspond to mcServer.ip, mcServer.port, and mcServer.name
            }
            serverList.push(newServer);
            await Promise.all([guildData.save(), interaction.editReply("Server added successfully")]);
        } catch (error) {
            log.error(error)
            await interaction.editReply(
                "Could not retrieve server status. Double check IP and make sure server is online."
            );
            log.error('Invalid Server IP / Server Offline')
        }
    }
}

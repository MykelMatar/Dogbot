import {CommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextInputStyle} from "discord.js";
import {status, statusBedrock} from 'minecraft-server-util'
import {IGuild, MinecraftServer, NewClient} from "../../dependencies/myTypes";
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
                .setRequired(true)
                .setMaxLength(30))
        .addNumberOption(option =>
            option.setName('port')
                .setDescription('Port of your server.')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        const serverList: MinecraftServer[] = guildData.mcServerData.serverList
        if (serverList.length === 10) {
            return interaction.editReply("Max number of servers reached (Limit of 10).");
        }

        let newServer: MinecraftServer = {
            name: undefined,
            ip: undefined,
            port: undefined
        };

        const {value: ip} = interaction.options.data.find(option => option.name === 'ip');
        const {value: name} = interaction.options.data.find(option => option.name === 'name');
        const {value: port = 25565} = interaction.options.data.find(option => option.name === 'port');

        newServer.name = name as string
        newServer.ip = ip as string
        newServer.port = port as number

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
                guildData.mcServerData.selectedServer = {ip, port, name} // assuming you have variables named ip, port, and name that correspond to mcServer.ip, mcServer.port, and mcServer.name
            }
            serverList.push(newServer);
            await Promise.all([guildData.save(), interaction.editReply("Server added successfully")]);
        } catch (error) {
            try {
                await statusBedrock(newServer.ip, newServer.port);
                // if server is the first added server, make it the selected server to track in /mc-server-status
                if (serverList.length === 0) {
                    const {ip, port, name} = newServer;
                    guildData.mcServerData.selectedServer = {ip, port, name} // assuming you have variables named ip, port, and name that correspond to mcServer.ip, mcServer.port, and mcServer.name
                }
                serverList.push(newServer);
                await Promise.all([guildData.save(), interaction.editReply("Server added successfully")]);
            } catch (e) {
                log.error(error)
                await interaction.editReply(
                    "Could not retrieve server status. Double check IP and make sure server is online."
                );
                log.error('Invalid Server IP / Server Offline')
            }
        }
    }
}

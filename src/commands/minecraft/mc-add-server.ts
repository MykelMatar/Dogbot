import {
    CommandInteraction,
    CommandInteractionOption,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import {status} from 'minecraft-server-util'
import {promptResponse} from "../../dependencies/helpers/promptResponse"
import {newClient} from "../../dependencies/myTypes";
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

    async execute(client: newClient, interaction: CommandInteraction, guildData) {
        const serverList = guildData.MCServerData.serverList
        if (serverList.length === 10) {
            await interaction.editReply("Max number of servers reached (Limit of 10).");
            return
        }

        // retrieve server IP and name
        let ip: string, name: string, port: number
        try {
            // if slash command is used
            ip = interaction.options.data[0].value as string;
            name = interaction.options.data[1].value as string;
            let portOption: CommandInteractionOption = (interaction.options.data.find(option => option.name === 'port'));
            if (portOption === undefined) {
                port = 25565
            } else port = portOption.value as number // value is guaranteed to be number
        } catch {
            // if button on /mc-list-servers is used
            ip = await promptResponse(interaction, "Input server IP (server must be online)", "Request Timeout");
            if (ip == null) return await interaction.editReply('*Invalid Server IP*');
            name = await promptResponse(interaction, "Input Name", "Request Timeout");
            if (name.toString().length > 30) {
                return await interaction.editReply('Please keep server name below 30 characters')
            }
            if (name.toString().length < 1) {
                return await interaction.editReply('*Invalid server name input.* ')
            }
            port = await promptResponse(interaction, "Input Server Port. If you are not sure, the default is 25565.", "Request Timeout");
            // not using Promise.all bc 1 response must be collected before the other / not simultaneous
        }
        let server = {name: name, ip: ip, port: port}; // setup variable to push to mongo

        // verify that IP is not already registered
        if (serverList.some(o => o["ip"] === ip)) {
            await interaction.editReply(
                "Server already registered, double check the IP or use **/mc-change-server-name** to change its name"
            );
            return log.error("Duplicate IP Detected");
        }

        // make sure IP is a valid server IP by checking its status (server must be online for this to work)
        try {
            await status(ip, port);

            // if server is the first added server, make it the selected server to track in !mc-server-status
            if (serverList.length === 0) {
                guildData.MCServerData.selectedServer.ip = ip;
                guildData.MCServerData.selectedServer.port = port;
                guildData.MCServerData.selectedServer.name = name;
            }

            serverList.push(server);
            await guildData.save();
            await interaction.editReply("Server added sucessfully");
        } catch (error) {
            log.error(error)
            await interaction.editReply(
                "*Could not retrieve server status. Double check IP and make sure server is online.*"
            );
            log.error('Invalid Server IP / Server Offline')
        }
    }
}

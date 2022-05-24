import {Category, Command} from "../../dependencies/classes/Command";
import {promptResponse} from "../../dependencies/helpers/promptResponse"
import {status} from 'minecraft-server-util'

export const mcAddServer = new Command(
    'mc-add-server',
    'Adds a new IP to the server list in Mongo',
    async (client, interaction) => {

        const serverList = mcAddServer.guildData.MCServerData.serverList
        if (serverList.length === 10) {
            await interaction.editReply("Max number of servers reached (Limit of 10).");
            return 
        }

        // retrieve server IP and name
        let ip, name;
        try {
            // if slash command is used
            ip = interaction.options._hoistedOptions[0].value;
            name = interaction.options._hoistedOptions[1].value;
        } catch {
            // if button on /mc-list-servers is used
            ip = await promptResponse(interaction, "Input server IP (server must be online)", "Request Timeout");
            name = await promptResponse(interaction, "Input Name", "Request Timeout");
            if (name.length > 30){
                await interaction.editReply('Please keep server name below 30 characters')
                return 
            }
            // not using Promise.all bc 1 response must be collected before the other / not simultaneous
        }
        let server = {name: name, ip: ip}; // setup variable to push to mongo


        // verify that IP is not already registered
        if (serverList.some(function (o) {
            return o["ip"] === ip;
        })) {
            await interaction.editReply(
                "Server already registered, double check the IP or use **/mc-change-server-name** to change its name"
            );
            return console.log("Duplicate IP Detected");
        }


        // make sure IP is a valid server IP by checking its status (server must be online for this to work)
        try {
            await status(ip);

            // if server is the first added server, make it the selected server to track in !mc-server-status
            if (serverList.length === 0) {
                mcAddServer.guildData.MCServerData.selectedServer.ip = ip;
                mcAddServer.guildData.MCServerData.selectedServer.name = name;
            }

            serverList.push(server);
            await mcAddServer.guildData.save();
            await interaction.editReply("Server added sucessfully");
        } catch (error) {
            console.log(error);
            await interaction.editReply(
                "Could not retrieve server status. Double check IP and make sure server is online."
            );
            console.log("Invalid Server IP / Server Offline");
        }
    }
)

mcAddServer.requiresAdmin = true;
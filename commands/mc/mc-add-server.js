const util = require("minecraft-server-util");
const promptResponse = require("../../helperFunctions/general_helpers/promptResponse");
const guilds = require("../../schemas/guild-schema");
let cmdStatus = 0;

module.exports = {
    name: "mc-add-server",
    description:
        "Adds a new IP to the server list in JSON file. Accessible via '/mc-list-servers' button or by slash command",
    async execute(client, interaction) {
        console.log(
            `mc-add-server requested by ${interaction.member.user.username}`
        );

        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            return interaction.editReply("Only Admins can use this command");
        }
        if (cmdStatus === 1) {
            return interaction.editReply("mc-add-server command already running.");
        }
        cmdStatus = 1;

        // retrieve server doc and list from mongo
        const currentGuild = await guilds.find({guildId: interaction.guildId});
        let serverList = currentGuild[0].MCServerData.serverList;

        if (serverList.length === 10) {
            await interaction.editReply(
                "Max number of servers reached. Remove a server to add a new one (Limit of 10)."
            );
            return (cmdStatus = 0);
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
            // not using Promise.all bc 1 response must be collected before the other / not simultaneous
        }

        // setup variable to push to mongo
        let server = {name: name, ip: ip};

        // verify that IP is not already registered
        if (serverList.some(function (o) {return o["ip"] === ip;})) {
            await interaction.editReply(
                "Server already registered, double check the IP or use **/mc-change-server-name** to change the name"
            );
            console.log("Duplicate IP Detected");
            return (cmdStatus = 0);
        }

        // verify that name is not already registered under a different IP
        if (serverList.some(function (o) {return o["name"] === name;})) {
            await interaction.editReply(
                "Cannot have duplicate server names, please choose a different name or use /mc-change-server-ip to change the IP of the existing server"
            );
            return (cmdStatus = 0);
        }

        // make sure IP is a valid server IP by checking its status (server must be online for this to work)
        try {
            await util.status(ip);
            // console.log(response);

            // if server is the first added server, make it the selected server to track in !mc-server-status
            if (serverList.length === 0) {
                currentGuild[0].MCServerData.selectedServer.ip = ip;
                currentGuild[0].MCServerData.selectedServer.name = name;
            }

            serverList.push(server);
            await currentGuild[0].save();

            await interaction.editReply("Server added sucessfully");
            cmdStatus = 0;
        } catch (error) {
            console.log(error);
            await interaction.editReply(
                "Could not retrieve server status. Double check IP and make sure server is online."
            );
            console.log("Invalid Server IP / Server Offline");
            cmdStatus = 0;
        }
    },
};

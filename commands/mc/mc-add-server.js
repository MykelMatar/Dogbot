const util = require('minecraft-server-util');
const data = require('../../data.json');
const writeToJson = require('../../helperFunctions/writeToJson');
let cmdStatus = 0;





module.exports = {
    name: 'mc-add-server',
    description: "Adds a new IP to the server list in JSON file. Accessible via 'listmc' button or by calling command",
    async execute(client, interaction, guildName) {
        console.log(`addmc requested by ${interaction.member.user.username}`);

        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }
        if (cmdStatus === 1) { return interaction.editReply('addmc command already running.') }
        cmdStatus = 1;


        // set max server size
        let serverList = data.Guilds[guildName].MCData.serverList
        let serverListSize = Object.values(serverList).length

        if (serverListSize === 10) {
            await interaction.editReply('Max number of servers reached. Remove a server to add a new one (Limit of 10).')
            return cmdStatus = 0;
        }

        // retrieve server IP and name
        const ip = interaction.options._hoistedOptions[0].value;
        const name = interaction.options._hoistedOptions[1].value;

        // verify that IP is not already registered
        if (Object.values(serverList).includes(ip)) {
            await interaction.editReply("Server already registered, double check the IP or use **!renamemc** to change the name")
            console.log("Duplicate IP Detected");
            return cmdStatus = 0;

        }

        // verify that name is not already registered under a different IP
        if (Object.keys(serverList).includes(name)) {
            await interaction.editReply('Cannot have duplicate server names, please choose a different name or use !changemcip to change the IP of the existing server')
            return cmdStatus = 0;
        }

        // make sure IP is a valid server IP by checking its status (server must be online for this to work)
        try {
            let response = await util.status(ip)
            console.log(response);

            // if server is the first added server, make it the selected server to track in !mc
            if (JSON.stringify(serverList) == '{}') {
                data.Guilds[guildName].MCData.selectedServer["IP"] = ip;    // use first input as default
                data.Guilds[guildName].MCData.selectedServer["title"] = name;
            }
            serverList[name] = ip;
            writeToJson(data);

            await interaction.editReply("Server added sucessfully")
            cmdStatus = 0;

        } catch (error) {
            await interaction.editReply('Could not retrieve server status. Double check IP and make sure server is online.')
            console.log('Invalid Server IP / Server Offline');
            cmdStatus = 0;
        }

    }
}

const util = require('minecraft-server-util');
const writeToJson = require('../helperFunctions/writeToJson');
const data = require('../data.json');
const createInteraction = require('../helperFunctions/createInteraction');
let cmdStatus = 0;



// TODO : check for duplicate names, dont allow

module.exports = {
    name: 'testaddmc',
    description: "Adds a new IP to the server list in JSON file. Accessible via 'listmc' button or by calling command",
    async execute(client, message, args, guildName) {
        console.log('addmc detected');

        // check for admin perms
        if (!message.member.permissions.has("ADMINISTRATOR")) {
            message.reply('Only Admins can use this command')
            return;
        }
        // prevent multiple instances from running
        if (cmdStatus == 1) {
            message.reply('addmc command already running.')
            return;
        }
        cmdStatus = 1; 

        // set max server size
        let serverList = data.Guilds[guildName].MCData.serverList
        let serverListSize = Object.values(serverList).length

        if (serverListSize == 10) {
            message.reply('Max number of servers reached. Remove a server to add a new one (Limit of 10).')
            return cmdStatus = 0;;
        }



        var IP = await createInteraction(message, 'Enter your Server IP. Make sure your server is currently online', 'Request timed out, please try again')

        if (IP === undefined) return cmdStatus = 0;;

        if (Object.values(serverList).includes(IP)) { // check if IP already exists before continuing
            message.reply("Server already registered, double check the IP or use **!renamemc** to change the name")
            console.log("Duplicate IP Detected");
            return cmdStatus = 0;;

        } else {
            try {
                let response = await util.status(IP) // make sure IP is valid server IP
                console.log(response);
                // retrieve name
                let name = await createInteraction(message, 'Valid server IP detected. Please enter a name for your server', 'Request timed out, please try again')
                if (name == undefined) return cmdStatus = 0;;
                // check if name already exists
                if (Object.keys(serverList).includes(name)) {
                    message.reply('Cannot have duplicate server names, please choose a different name or use !changemcip')
                    return cmdStatus = 0;;
                }
                // if server is the first added server, make it the selected server to track in !mc
                if (JSON.stringify(serverList) == '{}') {
                    data.Guilds[guildName].MCData.selectedServer["IP"] = IP;    // use first input as default
                    data.Guilds[guildName].MCData.selectedServer["title"] = name;
                }
                serverList[name] = IP;
                writeToJson(data);

                message.reply("Server added sucessfully")
                cmdStatus = 0;
                
            }
            catch (error) {
                message.reply('Could not retrieve server status. Double check IP and make sure server is online.')
                console.log('Invalid Server IP / Server Offline');
                cmdStatus = 0;
            }
        }
    }
}

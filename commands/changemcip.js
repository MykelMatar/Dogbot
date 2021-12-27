const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const util = require('minecraft-server-util');
const data = require('../data.json');
const writeToJson = require('../helperFunctions/writeToJson');
const generateMenuOptions = require('../helperFunctions/generateMenuOptions');
const preventInteractionCollision = require('../helperFunctions/preventInteractionCollision');
const createInteraction = require('../helperFunctions/createInteraction');
let cmdStatus = 0;




module.exports = {
    name: 'changemcip',
    description: "changes IP of existing server. Accessible via 'listmc' button or by calling command.",
    async execute(client, message, args, guildName) {
        console.log('rename mc detected');

        // check for admin perms & prevent multiple instances from running
        if (!message.member.permissions.has("ADMINISTRATOR")) { return message.reply('Only Admins can use this command') }  // check for admin perms
        if (cmdStatus == 1) { return message.reply('renamemc command already running.') } // prevent multiple instances from running
        cmdStatus = 1;

        let serverList = data.Guilds[guildName].MCData.serverList;
        let serverListSize = Object.values(serverList).length

        // make sure there is at least 1 server
        if (serverListSize == 0) {
            message.reply('No Registered Servers, use !addmc or !listmc to add servers.')
            return;
        }

        // create variables and generate options for select menu
        var options = [];
        options = await generateMenuOptions(guildName, serverListSize);
        let option = options[0];
        let label = options[1];
        let value = options[2];
        let description = options[3]

        console.log(option);

        // generate select menu
        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('selection')
                    .setPlaceholder('Nothing selected')
                    .addOptions(option),
            );

        // send embed and store in variable to edit later
        let sent = await message.reply({ content: 'Select the server you want to change the IP of', ephemeral: true, components: [row] });

        // Response collection and handling
        let filter = i => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', max: 1, time: 15000 });
        const command = client.commands.get('mc');
        var serverName;

        preventInteractionCollision(message, collector, sent)

        collector.on('collect', async i => {
            var selection = i.values[0]
            for (let i = 0; i < serverListSize; i++) {
                if (selection == `selection${i}`) {
                    serverName = Object.keys(serverList)[i]
                }
            }

            console.log(serverName);

            var IP = await createInteraction(message, 'Enter the new IP of your server', 'Request timed out, please try again.')
            if (IP == undefined) return cmdStatus = 0;

            // verify that IP is not already registered
            if (Object.values(serverList).includes(IP)) {
                message.reply("Server already registered, double check the IP or use **!renamemc** to change the name")
                console.log("Duplicate IP Detected");
                return cmdStatus = 0;

            } else {
                try {
                    // make sure IP is a valid server IP by checking its status (server must be online for this to work)
                    let response = await util.status(IP)
                    console.log(response);

                    serverList[serverName] = IP;
                    writeToJson(data);

                    await message.reply('Server IP changed sucessfully')
                    cmdStatus = 0;

                }
                catch (error) {
                    message.reply('Could not retrieve server status. Double check IP and make sure server is online.')
                    console.log('Invalid Server IP / Server Offline');
                    cmdStatus = 0;
                }
            }
        });

        collector.on('end', async collected => {
            console.log(`renamemc collected ${collected.size} menu selections`)
            if (collected.size == 1) await sent.edit({ content: serverName + ' selected for IP change', ephemeral: true, components: [] })
            else await sent.edit({ content: 'Request Timeout', ephemeral: true, components: [] })
            cmdStatus = 0;
        });
    }
}

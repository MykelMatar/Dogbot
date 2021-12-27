const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const data = require('../data.json');
const writeToJson = require('../helperFunctions/writeToJson');
const generateMenuOptions = require('../helperFunctions/generateMenuOptions');
const preventInteractionCollision = require('../helperFunctions/preventInteractionCollision');
const createInteraction = require('../helperFunctions/createInteraction');
let cmdStatus = 0;





module.exports = {
    name: 'renamemc',
    description: "Renames mc server. Accessible via 'listmc' button or by calling command.",
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
            return cmdStatus = 0;
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
        let sent = await message.reply({ content: 'Select the server you want to rename', ephemeral: true, components: [row] });

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

            let IP = JSON.stringify(serverList[serverName]).replace(/[""]/g, '');
            let newName = await createInteraction(message, 'Enter the new name of your server', 'Request timed out, please try again.')
            if (newName == undefined) return cmdStatus = 0;

            if (Object.keys(serverList).includes(newName)) {
                message.reply('Cannot have duplicate server names, please choose a different name or use !changemcip to change the IP of the existing server')
                return cmdStatus = 0;
            }

            serverList[newName] = IP;
            delete serverList[serverName];
            writeToJson(data)

            message.reply("Server renamed sucessfully")


            // let filter = m => m.author.id === message.author.id
            // message.reply("Enter the new name of your server.", { fetchReply: true })
            //     .then(() => {
            //         message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
            //             .then(collected => {
            //                 let newName = collected.first().content;
            //                 let IP = JSON.stringify(serverList[serverName]).replace(/[""]/g, '');

            //                 serverList[newName] = IP;
            //                 delete serverList[serverName];
            //                 writeToJson(data)

            //                 message.reply("Server renamed sucessfully")
            //             })
            //             .catch(collected => {
            //                 message.reply('Error naming server. Please try again.')
            //             });

            //     })
            //     .catch((error) => {
            //         message.reply('Request timed out. Please try again.')
            //     })
        });

        collector.on('end', async collected => {
            console.log(`renamemc collected ${collected.size} menu selections`)
            if (collected.size == 1) await sent.edit({ content: serverName + ' selected for renaming', ephemeral: true, components: [] })
            else await sent.edit({ content: 'Request Timeout', ephemeral: true, components: [] })
            cmdStatus = 0;
        });
    }
}

const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const data = require('../data.json');
const writeToJson = require('../helperFunctions/writeToJson');
const generateMenuOptions = require('../helperFunctions/generateMenuOptions');
const preventInteractionCollision = require('../helperFunctions/preventInteractionCollision');
const createInteraction = require('../helperFunctions/createInteraction');
let cmdStatus = 0;





module.exports = {
    name: 'renamemc',
    description: "Renames existing mc server. Accessible via 'listmc' button or by calling command.",
    async execute(client, interaction, guildName) {
        console.log(`rename requested by ${interaction.member.user.username}`);

        // check for admin perms & prevent multiple instances from running
        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.reply('Only Admins can use this command') }  // check for admin perms
        if (cmdStatus == 1) { return interaction.reply('renamemc command already running.') } // prevent multiple instances from running
        cmdStatus = 1;

        let serverList = data.Guilds[guildName].MCData.serverList;
        let serverListSize = Object.values(serverList).length

        // make sure there is at least 1 server
        if (serverListSize == 0) {
            interaction.reply('No Registered Servers, use !addmc or !listmc to add servers.')
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
        await interaction.reply({ content: 'Select the server you want to rename', ephemeral: true, components: [row] });

        // Response collection and handling
        let filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', max: 1, time: 15000 });
        const command = client.commands.get('mc');
        var serverName, newName;

        await preventInteractionCollision(interaction, collector)

        collector.on('collect', async i => {
            var selection = i.values[0]
            for (let i = 0; i < serverListSize; i++) {
                if (selection == `selection${i}`) {
                    serverName = Object.keys(serverList)[i]
                }
            }

            // retrieve server IP and name
            let ip = JSON.stringify(serverList[serverName]).replace(/[""]/g, '');
            newName = interaction.options._hoistedOptions[0].value

            if (Object.keys(serverList).includes(newName)) {
                interaction.reply('Cannot have duplicate server names, please choose a different name or use !changemcip to change the IP of the existing server')
                return cmdStatus = 0;
            }

            serverList[newName] = ip;
            delete serverList[serverName];
            writeToJson(data)

            interaction.editReply(serverName + ' selected for renaming')

        });

        collector.on('end', async collected => {
            console.log(`renamemc collected ${collected.size} menu selections`)
            if (collected.size == 1) await interaction.editReply({ content: ` ${serverName} renamed successfully to ${newName}`, ephemeral: true, components: [] })
            else await interaction.editReply({ content: 'Request Timeout', ephemeral: true, components: [] })
            cmdStatus = 0;
        });
    }
}

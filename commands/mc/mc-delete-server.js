const {MessageActionRow, MessageSelectMenu} = require('discord.js');
const data = require('../../data.json');
const writeToJson = require('../../helperFunctions/writeToJson');
const generateMcMenuOptions = require('../../helperFunctions/generateMcMenuOptions');
const preventInteractionCollision = require('../../helperFunctions/preventInteractionCollision');
let cmdStatus = 0;


module.exports = {
    name: 'mc-delete-server',
    description: "Removes server from server list in JSON file. Accessible via 'listmc' button or by calling command",
    async execute(client, interaction, guildName) {
        console.log(`mc-delete-server requested by ${interaction.member.user.username}`);

        // check for admin perms & prevent multiple instances from running
        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            return interaction.editReply('Only Admins can use this command')
        }  // check for admin perms
        if (cmdStatus === 1) {
            return interaction.reply('mc-delete-server command already running.')
        } // prevent multiple instances from running
        cmdStatus = 1;

        let serverList = data.Guilds[guildName].MCData.serverList;
        let serverListSize = Object.values(serverList).length

        // ensures command does not execute if 0 or 1 server exists
        if (serverListSize === 0) {
            await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
            return cmdStatus = 0;
        }
        if (serverListSize === 1) {
            await interaction.editReply(
                `Cannot remove the only existing server, use /mc-add-server or /mc-list-servers to add servers, 
                          or change server information with /mc-change-server-name and /mc-change-server-ip.`
            )
            return cmdStatus = 0;
        }

        let options = [];
        options = await generateMcMenuOptions(guildName, serverListSize);
        let option = options[0];

        // generate select menu
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('selection')
                    .setPlaceholder('Nothing selected')
                    .addOptions(option),
            );

        await interaction.editReply({content: 'Select a Server to Delete', components: [row]});

        const filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'SELECT_MENU',
            max: 1,
            time: 15000
        });
        let serverName;

        await preventInteractionCollision(interaction, collector)

        collector.on('collect', async i => {

            let selection = i.values[0];
            for (let i = 0; i < serverListSize; i++) {
                if (selection == `selection${i}`) {
                    // delete server and if its selectedServer, delete it from there
                    let selectedServer = data.Guilds[guildName].MCData.selectedServer
                    let selectedServerIP = Object.values(data.Guilds[guildName].MCData.selectedServer)[1]
                    serverName = Object.keys(serverList)[i]
                    let serverIP = Object.values(serverList)[i]
                    delete serverList[serverName];
                    
                    // set a new selected server if the current one was deleted 
                    if (selectedServerIP == serverIP) {
                        selectedServer['title'] = Object.keys(serverList)[0]
                        selectedServer["IP"] = Object.values(serverList)[0]
                    }
                    writeToJson(data);
                }
            }
            if (i.customId === "selection") {
                await i.update({content: 'Server Deleted', components: []});
            }
        });

        collector.on('end', async collected => {
            if (collected.size === 1) await interaction.editReply({content: serverName + ' Deleted', components: []})
            else await interaction.editReply({content: 'Request Timeout', components: []})
        });

        cmdStatus = 0;
    }
}
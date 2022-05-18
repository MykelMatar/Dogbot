const {MessageActionRow, MessageSelectMenu} = require('discord.js');
const generateMcMenuOptions = require('../../helperFunctions/mc_helpers/generateMcMenuOptions');
const guilds = require("../../schemas/guild-schema");
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

        // retrieve server doc and list from mongo
        const currentGuild = await guilds.find({guildId: interaction.guildId})
        let serverList = currentGuild[0].MCServerData.serverList
        let serverListSize = serverList.length

        // ensures command does not execute if 0 or 1 server exists
        if (serverListSize === 0) {
            await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
            return cmdStatus = 0;
        }
        if (serverListSize === 1) {
            await interaction.editReply(
                `Cannot remove the only existing server, use /mc-add-server or /mc-list-servers to add servers, or change server information with /mc-change-server-name and /mc-change-server-ip.`
            )
            return cmdStatus = 0;
        }

        let options = [];
        options = await generateMcMenuOptions(guildName, interaction, serverListSize);
        let option = options[0];

        // generate select menu
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('delete-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(option),
            );

        await interaction.editReply({content: 'Select a Server to Delete', components: [row]});

        const filter = i => i.user.id === interaction.member.user.id
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'SELECT_MENU',
            time: 15000
        });

        let serverName;

        collector.on('collect', async i => {
            if (i.customId !== 'delete-menu') return collector.stop() // check for correct menu interaction
            let selectedServerIP, serverIP

            for (let j = 0; j < serverListSize; j++) {
                if (i.values[0] === `selection${j}`) {
                    // delete server and if its selectedServer, delete it from there
                    selectedServerIP = currentGuild[0].MCServerData.selectedServer.ip // selectedServer ip
                    serverIP = serverList[j].ip // server selected for deletion's ip
                    serverName = serverList[j].name // server selected for deletion's name

                    serverList.splice(j, 1) // delete selected server from array
                }
            }
            // set a new selected server if the current one was deleted 
            if (selectedServerIP === serverIP) {
                currentGuild[0].MCServerData.selectedServer.ip = serverList[0].ip
                currentGuild[0].MCServerData.selectedServer.name = serverList[0].name
            }
            await currentGuild[0].save() // save changes to mongo
            collector.stop()
        });

        collector.on('end', async collected => {
            if (collected.size === 0)
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Request Timeout',
                    components: []
                })
            else if (collected.first().customId !== 'delete-menu')
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Avoid using multiple commands at once',
                    components: []
                })
            else if (collected.first().customId === 'delete-menu')
                await interaction.editReply({
                    ephemeral: true,
                    content: serverName + ' Deleted',
                    components: []
                })
        });
        cmdStatus = 0;
    }
}
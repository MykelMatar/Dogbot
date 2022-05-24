import {Category, Command} from "../../dependencies/classes/Command";
import {generateMCMenuOptions} from "../../dependencies/helpers/generateMCMenuOptions";
import {MessageActionRow, MessageSelectMenu} from "discord.js";

export const mcDeleteServer = new Command(
    'mc-delete-server',
    'deletes registered server',
    async (client, interaction, guildName?) => {
        
        const MCServerData = mcDeleteServer.guildData.MCServerData
        let serverListSize = MCServerData.serverList.length

        // ensures command does not execute if 0 or 1 server exists
        if (serverListSize === 0) {
            await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
            return
        }
        if (serverListSize === 1) {
            await interaction.editReply(
                `Cannot remove the only existing server, use /mc-add-server or /mc-list-servers to add servers, or change server information with /mc-change-server-name and /mc-change-server-ip.`
            )
            return 
        }

        let options = [];
        options = await generateMCMenuOptions(interaction, guildName, serverListSize);
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
                    selectedServerIP = MCServerData.selectedServer.ip // selectedServer ip
                    serverIP = MCServerData.serverList[j].ip // server selected for deletion's ip
                    serverName = MCServerData.serverList[j].name // server selected for deletion's name

                    MCServerData.serverList.splice(j, 1) // delete selected server from array
                }
            }
            // set a new selected server if the current one was deleted 
            if (selectedServerIP === serverIP) {
                MCServerData.selectedServer.ip = MCServerData.serverList[0].ip
                MCServerData.selectedServer.name = MCServerData.serverList[0].name
            }
            await mcDeleteServer.guildData.save() // save changes to mongo
            collector.stop()
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Request Timeout',
                    components: []
                });
                console.log('Request Timeout')
            }
            else if (collected.first().customId !== 'delete-menu') {
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Avoid using multiple commands at once',
                    components: []
                });
                console.log('Command Collision Detected')
            }
            else if (collected.first().customId === 'delete-menu') {
                await interaction.editReply({
                    ephemeral: true,
                    content: serverName + ' Deleted',
                    components: []
                });
                console.log('Server Deleted Successfully')
            }
        });
    }
)

mcDeleteServer.requiresAdmin = true;
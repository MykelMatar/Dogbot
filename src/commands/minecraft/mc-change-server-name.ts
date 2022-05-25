import {MessageActionRow, MessageSelectMenu} from "discord.js";
import {Command} from "../../dependencies/classes/Command";
import {generateMCMenuOptions} from "../../dependencies/helpers/generateMCMenuOptions";

export const mcChangeServerName = new Command(
    'mc-change-server-name',
    'renames registered server',
    async (client, interaction, guildName?) => {

        const MCServerData = mcChangeServerName.guildData.MCServerData
        let serverListSize = MCServerData.serverList.length

        // make sure there is at least 1 server
        if (serverListSize === 0) {
            await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
            return
        }

        // retrieve new name from user input
        let newName = interaction.options.data[0].value
        if (newName.toString().length > 30) {
            await interaction.editReply('Please keep server name below 30 characters')
            return
        }

        // verify that name is not already registered under a different IP
        if (MCServerData.serverList.some(function (o) {
            return o["name"] === newName;
        })) {
            await interaction.editReply(
                "Cannot have duplicate server names, please choose a different name or use /mc-change-server-ip to change the IP of the existing server"
            );
            return;
        }

        // create variables and generate options for select menu
        let options: any[];
        options = await generateMCMenuOptions(interaction, guildName, serverListSize);

        // generate select menu
        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('change-server-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(options[0]),
            );

        // send embed
        await interaction.editReply({content: 'Select the server you want to rename', components: [row]});

        // Response collection and handling
        let filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'SELECT_MENU',
            time: 10000
        });
        let serverName

        collector.on('collect', async i => {
            if (i.customId !== 'change-server-menu') return collector.stop()
            for (let j = 0; j < serverListSize; j++) {
                if (i.values[0] === `selection${j}`) {
                    serverName = MCServerData.serverList[j].name
                    MCServerData.serverList[j].name = newName
                }
            }
            // change selected server name if it was changed
            if (MCServerData.selectedServer.name === serverName)
                MCServerData.selectedServer.name = newName

            await mcChangeServerName.guildData.save() // save changes to mongo
            collector.stop()
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({content: 'Request Timeout', components: []});
                console.log('Request Timeout')
            } else if (collected.first().customId !== 'change-server-menu') {
                await interaction.editReply({content: 'Avoid using multiple commands at once', components: []});
                console.log('Command Collision Detected')
            } else if (collected.first().customId === 'change-server-menu') {
                await interaction.editReply({
                    content: ` ${serverName} renamed successfully to ${newName}`, components: []
                });
                console.log('Server Renamed Successfully')
            }
        });
    })
mcChangeServerName.requiresAdmin = true
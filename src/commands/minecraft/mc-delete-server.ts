import {
    ActionRowBuilder,
    ComponentType,
    PermissionFlagsBits,
    SelectMenuBuilder,
    CommandInteraction,
    SlashCommandBuilder
} from "discord.js";
import {generateMCMenuOptions} from "../../dependencies/helpers/generateMCMenuOptions";
import {newClient} from "../../dependencies/myTypes";

export const mcDeleteServer = {
    data: new SlashCommandBuilder()
        .setName('mc-delete-server')
        .setDescription('Deletes a registered MC server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(client: newClient, interaction: CommandInteraction, guildData, guildName: string) {
        const MCServerData = guildData.MCServerData
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

        let options = await generateMCMenuOptions(interaction, guildName, serverListSize);
        let option = options[0];

        // generate select menu
        const row = new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('delete-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(option),
            );

        await interaction.editReply({content: 'Select a Server to Delete', components: [row]});

        const filter = i => i.user.id === interaction.member.user.id
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.SelectMenu,
            time: 15000
        });

        let serverName;

        try {
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
                await guildData.save() // save changes to mongo
                collector.stop()
            });
        } catch (e) {
            console.log(e)
        }

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({content: 'Request Timeout', components: []});
                console.log('Request Timeout')
            } else if (collected.first().customId !== 'delete-menu') {
                await interaction.editReply({content: 'Avoid using multiple commands at once', components: []});
                console.log('Command Collision Detected')
            } else if (collected.first().customId === 'delete-menu') {
                await interaction.editReply({content: serverName + ' Deleted', components: []});
                console.log('Server Deleted Successfully')
            }
        });
    }
}
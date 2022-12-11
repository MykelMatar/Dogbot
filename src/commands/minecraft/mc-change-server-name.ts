import {
    ActionRowBuilder,
    CommandInteraction,
    ComponentType,
    Message,
    PermissionFlagsBits,
    SelectMenuBuilder,
    SlashCommandBuilder
} from "discord.js";
import {McMenuOptionGenerator} from "../../dependencies/helpers/mcMenuOptionGenerator";
import {MenuGeneratorReturnValues, newClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {terminationListener} from "../../dependencies/helpers/terminationListener";

export const mcChangeServerName = {
    data: new SlashCommandBuilder()
        .setName('mc-change-server-name')
        .setDescription('Renames an existing server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('new-name')
                .setDescription('The new server name')
                .setRequired(true)),

    async execute(client: newClient, interaction: CommandInteraction, guildData, guildName: string) {
        const MCServerData = guildData.MCServerData
        let serverListSize = MCServerData.serverList.length

        // make sure there is at least 1 server
        if (serverListSize === 0) {
            await interaction.editReply('*No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.*')
            return
        }

        // retrieve new name from user input
        let newName = interaction.options.data[0].value
        if (newName.toString().length > 30) {
            await interaction.editReply('*Please keep server name below 30 characters*')
            return log.error("name greater than 30 char");
        }

        // verify that name is not already registered under a different IP
        if (MCServerData.serverList.some(server => server["name"] === newName)) {
            await interaction.editReply(
                "*Cannot have duplicate server names, please choose a different name or use /mc-change-server-ip to change the IP of the existing server*"
            );
            return log.error("Duplicate Name Detected");
        }

        // create variables and generate options for select menu
        let optionGenerator: MenuGeneratorReturnValues = await McMenuOptionGenerator(interaction, guildName, serverListSize);

        // generate select menu
        let row = new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('change-server-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(optionGenerator.optionsArray),
            );

        // send embed
        let sent: Message = await interaction.editReply({
            content: 'Select the server you want to rename',
            components: [row]
        });

        // Response collection and handling
        let filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.SelectMenu,
            time: 10000
        });

        let serverName
        collector.on('collect', async i => {
            if (i.message.id != sent.id) return
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

            await guildData.save() // save changes to mongo
            collector.stop()
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({content: '*Request Timeout*', components: []});
                log.error('Request Timeout')
            } else if (collected.first().customId !== 'change-server-menu') {
                await interaction.editReply({content: '*Avoid using multiple commands at once*', components: []});
                log.error('Command Collision Detected')
            } else if (collected.first().customId === 'change-server-menu') {
                await interaction.editReply({
                    content: ` **${serverName}** renamed successfully to **${newName}**`, components: []
                })
                log.info('Server Renamed Successfully')
            }
        });

        let terminate: boolean = false
        await terminationListener(client, collector, terminate)
    }
}
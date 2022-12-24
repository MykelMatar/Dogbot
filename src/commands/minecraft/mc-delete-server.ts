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
import {DiscordMenuGeneratorReturnValues, GuildSchema, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {terminationListener} from "../../dependencies/helpers/terminationListener";


export const mcDeleteServer = {
    data: new SlashCommandBuilder()
        .setName('mc-delete-server')
        .setDescription('Deletes a registered MC server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema, guildName: string) {
        const MCServerData = guildData.MCServerData
        let serverListSize: number = MCServerData.serverList.length
        if (serverListSize === 0) {
            return await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
        }
        if (serverListSize === 1) {
            return await interaction.editReply(
                `Cannot remove the only existing server, use /mc-add-server or /mc-list-servers to add servers, or change server information with /mc-change-server-name and /mc-change-server-ip.`
            )
        }

        let optionGenerator: DiscordMenuGeneratorReturnValues = await McMenuOptionGenerator(interaction, guildName, serverListSize);
        const row = new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('delete-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(optionGenerator.optionsArray),
            );
        let sent: Message = await interaction.editReply({content: 'Select a Server to Delete', components: [row]});

        const filter = i => i.user.id === interaction.member.user.id
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.SelectMenu,
            time: 15000
        });

        let serverName;
        try {
            collector.on('collect', async i => {
                if (i.message.id != sent.id) return
                if (i.customId !== 'delete-menu') return collector.stop()
                let selectedServerIP, serverIP

                for (let j = 0; j < serverListSize; j++) {
                    if (i.values[0] === `selection${j}`) {
                        selectedServerIP = MCServerData.selectedServer.ip
                        serverIP = MCServerData.serverList[j].ip
                        serverName = MCServerData.serverList[j].name
                        MCServerData.serverList.splice(j, 1)
                    }
                }
                if (selectedServerIP === serverIP) {
                    MCServerData.selectedServer.ip = MCServerData.serverList[0].ip
                    MCServerData.selectedServer.port = MCServerData.serverList[0].port
                    MCServerData.selectedServer.name = MCServerData.serverList[0].name
                }
                await guildData.save()
                collector.stop()
            });
        } catch (e) {
            log.error(e)
        }

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({content: '*Request Timeout*', components: []});
                log.error('Request Timeout')
            } else if (collected.first().customId !== 'delete-menu') {
                await interaction.editReply({content: '*Avoid using multiple commands at once*', components: []});
                log.error('Command Collision Detected')
            } else if (collected.first().customId === 'delete-menu') {
                await interaction.editReply({content: `**${serverName}** deleted`, components: []});
                log.info('Server Deleted Successfully')
            }
        });

        let terminate: boolean = false
        await terminationListener(client, collector, terminate)
    }
}
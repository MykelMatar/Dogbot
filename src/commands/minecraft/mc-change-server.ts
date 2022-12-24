import {McMenuOptionGenerator} from "../../dependencies/helpers/mcMenuOptionGenerator";
import {
    ActionRowBuilder,
    APISelectMenuOption,
    CommandInteraction,
    ComponentType,
    Message,
    SelectMenuBuilder,
    SlashCommandBuilder
} from "discord.js";
import {DiscordMenuGeneratorReturnValues, GuildSchema, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {terminationListener} from "../../dependencies/helpers/terminationListener";

export const mcChangeServer = {
    data: new SlashCommandBuilder()
        .setName('mc-change-server')
        .setDescription('changes the server being tracked by mc-server-status'),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema, guildName: string) {
        const MCServerData = guildData.MCServerData
        let serverListSize: number = MCServerData.serverList.length
        if (serverListSize === 0) {
            await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
            return;
        } else if (serverListSize === 1) {
            await interaction.editReply('Only 1 Registered Server, use /mc-add-server or /mc-list-servers to add more servers.')
            return;
        }

        let optionGenerator: DiscordMenuGeneratorReturnValues = await McMenuOptionGenerator(interaction, guildName, serverListSize);
        let optionsArray = optionGenerator.optionsArray
        let label = optionGenerator.options.label
        let description = optionGenerator.options.description

        let row = new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('change-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(optionsArray),
            );

        let sent: Message = await interaction.editReply({
            content: 'Select a Different Server to Check',
            components: [row],
            embeds: []
        });

        const filter = i => i.user.id === interaction.member.user.id
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.SelectMenu,
            time: 15000
        });

        try {
            collector.on('collect', async i => {
                if (i.message.id != sent.id) return
                if (i.customId !== 'change-menu') return collector.stop()
                for (let j = 0; j < serverListSize; j++) {
                    if (i.values[0] === `selection${j}`) {
                        MCServerData.selectedServer.name = label[j];
                        MCServerData.selectedServer.ip = description[j];
                    }
                }
                await guildData.save()
                collector.stop()
            });
        } catch (e) {
            log.error(e)
        }

        collector.on('end', async collected => {
            if (collected.size === 0)
                await interaction.editReply({content: 'Request Timeout', components: []})
            else if (collected.first().customId !== 'change-menu')
                await interaction.editReply({content: '*Avoid using multiple commands at once*', components: []})
            else if (collected.first().customId === 'change-menu') {
                await interaction.editReply({
                    content: `Now tracking **${MCServerData.selectedServer.name}**. Retrieving server status...`,
                    components: []
                })
                await client.commands.get('mc-server-status').execute(client, interaction, guildData, guildName);
            }
        });

        let terminate: boolean = false
        await terminationListener(client, collector, terminate)
    }
}
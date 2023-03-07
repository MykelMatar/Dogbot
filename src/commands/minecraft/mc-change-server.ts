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
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/terminationListener";

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

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.SelectMenu,
            time: 15000,
            max: 1,
            filter: (i) => {
                if (i.user.id !== interaction.member.user.id) return false;
                return i.message.id === sent.id;
            },
        });

        let terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)

        collector.on('collect', async i => {
            const selectedServerIP = i.values[0]
            const selectedServer = MCServerData.serverList.find(server => {
                return server.ip === selectedServerIP
            })
            MCServerData.selectedServer.name = selectedServer.name;
            MCServerData.selectedServer.ip = selectedServer.ip;

            await guildData.save()
        });

        collector.on('end', async collected => {
            removeTerminationListener(terminateBound)
            if (collected.size === 0) {
                await interaction.editReply({content: 'Request Timeout', components: []})
            } else if (collected.first().customId === 'change-menu') {
                await interaction.editReply({
                    content: `Now tracking **${MCServerData.selectedServer.name}**. Retrieving server status...`,
                    components: []
                })
                await client.commands.get('mc-server-status').execute(client, interaction, guildData, guildName);
            }
        });
    }
}
import {McMenuOptionGenerator} from "../../dependencies/helpers/mcMenuOptionGenerator";
import {
    ActionRowBuilder,
    ComponentType,
    SelectMenuBuilder,
    CommandInteraction,
    SlashCommandBuilder,
    APISelectMenuOption, Message
} from "discord.js";
import {MenuGeneratorReturnValues, newClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {terminationListener} from "../../dependencies/helpers/terminationListener";

export const mcChangeServer = {
    data: new SlashCommandBuilder()
        .setName('mc-change-server')
        .setDescription('changes the server being tracked by mc-server-status'),

    async execute(client: newClient, interaction: CommandInteraction, guildData, guildName: string) {
        const MCServerData = guildData.MCServerData
        let serverListSize: number = MCServerData.serverList.length

        // make sure there are at least 2 servers
        if (serverListSize === 0) {
            await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
            return;
        } else if (serverListSize === 1) {
            await interaction.editReply('Only 1 Registered Server, use /mc-add-server or /mc-list-servers to add more servers.')
            return;
        }

        // create variables and generate options for select menu
        let optionGenerator: MenuGeneratorReturnValues = await McMenuOptionGenerator(interaction, guildName, serverListSize);
        let optionsArray = optionGenerator.optionsArray
        let label = optionGenerator.options.label
        let description = optionGenerator.options.description

        // generate select menu
        let row = new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('change-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(optionsArray),
            );

        // send embed and store in variable to edit later
        let sent: Message = await interaction.editReply({content: 'Select a Different Server to Check', components: [row], embeds: []});

        // Response collection and handling
        const filter = i => i.user.id === interaction.member.user.id
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.SelectMenu,
            time: 15000
        });

        try {
            collector.on('collect', async i => {
                // find user selection and change mongo doc info
                if (i.message.id != sent.id) return
                if (i.customId !== 'change-menu') return collector.stop()
                for (let j = 0; j < serverListSize; j++) {
                    if (i.values[0] === `selection${j}`) {
                        MCServerData.selectedServer.name = label[j];
                        MCServerData.selectedServer.ip = description[j];
                    }
                }
                await guildData.save() // write to mongo
                collector.stop()
            });
        } catch (e) {
            log.error(e)
        }

        // check whether a user responded or not, and edit embed accordingly
        collector.on('end', async collected => {
            if (collected.size === 0)
                await interaction.editReply({content: 'Request Timeout', components: []})
            else if (collected.first().customId !== 'change-menu')
                await interaction.editReply({content: '*Avoid using multiple commands at once*', components: []})
            else if (collected.first().customId === 'change-menu') {
                await interaction.editReply({
                    content: `*Now tracking *${MCServerData.selectedServer.name}*. Retrieving server status...*`,
                    components: []
                })
                await client.commands.get('mc-server-status').execute(client, interaction, guildData, guildName);
            }
        });

        let terminate: boolean = false
        await terminationListener(client, collector, terminate)
    }
}
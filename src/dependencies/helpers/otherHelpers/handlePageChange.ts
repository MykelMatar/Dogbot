import {ActionRowBuilder, ButtonBuilder, CommandInteraction, ComponentType} from "discord.js";


export default async function(interaction: CommandInteraction, row: ActionRowBuilder<ButtonBuilder>, pages: Object, commandName: string) {
    const sent = await interaction[interaction.deferred ? 'editReply' : 'reply']({
        embeds: [pages[0]],
        components: [row]
    });

    const patchNotesFilter = async (i) => {
        if (i.message.interaction.id != sent.id) return false
        return ['nextPage', 'prevPage', 'wiki'].includes(i.customId);
    }
    const helpFilter = async (i) => {
        if (i.message.id != sent.id) return false
        return ['nextPage', 'prevPage', 'wiki'].includes(i.customId);
    }

    const collector = interaction.channel.createMessageComponentCollector({
        filter: commandName === 'patch-notes' ? patchNotesFilter : helpFilter,
        time: 900_000,
        componentType: ComponentType.Button
    });

    let pageNumber = 0

    collector.on('collect', async i => {
        const isNotFirstPage = pageNumber > 0
        const isNotLastPage = pageNumber < Object.keys(pages).length - 1

        if (i.customId === 'nextPage' && isNotLastPage) {
            pageNumber++
            await i.update({embeds: [pages[pageNumber]], components: [row]});
        }
        if (i.customId === 'prevPage' && isNotFirstPage) {
            pageNumber--
            await i.update({embeds: [pages[pageNumber]], components: [row]});
        }
    });

    collector.on('end', async () => {
        await sent.edit({components: []});
    })
}
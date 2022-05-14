/**
 * prevents multiple collectors from running at once to avoid invalid collections
 * @param client
 * @param interaction
 * @param collector
 */
async function preventInteractionCollision(client, interaction, collector) {

    const interactionCollector = interaction.channel.createMessageComponentCollector({time: 15000 })

    return interactionCollector.on('collect', async i => {
        console.log(i + '\r\n' + i.isCommand())
        if (i.isCommand()) { 
            interactionCollector.stop();
            collector.stop();
            await interaction.editReply({ephemeral: true, content: 'command aborted', components: [] })
        }
    });
}

module.exports = preventInteractionCollision;
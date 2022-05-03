/**
 * prevents multiple collectors from running at once to avoid invalid collections
 * @param  {} message
 * @param  {} collector
 * @param  {} sent
 */
async function preventInteractionCollision(interaction, collector) {

    const interactionCollector = message.channel.createMessageComponentCollector({time: 15000 })

    return interactionCollector.on('collect', async i => {
        if (i.isCommand()) { 
            interactionCollector.stop();
            collector.stop();
            await interaction.editReply({ephemeral: true, content: 'command aborted', components: [] })
        }
    });
}

module.exports = preventInteractionCollision;
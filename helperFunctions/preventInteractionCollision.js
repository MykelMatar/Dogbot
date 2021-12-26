/**
 * @param  {} message
 * @param  {} collector
 * @param  {} sent
 */
async function preventInteractionCollision(message, collector, sent) {
    cmdList = ['!renamemc', '!delmc', '!changemc', '!elp']  // commands who's collectors collide with each other if executed simultaneously 

    const msgCollector = message.channel.createMessageCollector({ time: 15000 })
    return msgCollector.on('collect', async m => {
        if (cmdList.includes(m.content)) { 
            msgCollector.stop();
            collector.stop();
            await sent.edit({ content: 'command aborted', ephemeral: true, components: [] })
        }
    });
}

module.exports = preventInteractionCollision;
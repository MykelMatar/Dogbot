/**
 * unpins embed passed to it
 * @param  {string} message
 * @param  {string} embedId
 */
async function unpinEmbed(message, embedId) {
    if (embedId != null) {
        (await message.channel.messages.fetch(embedId)).unpin();
    }
}

module.exports = unpinEmbed;
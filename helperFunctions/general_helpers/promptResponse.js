/**
 * sends a message and collects the response
 * @param  interaction
 * @param  {string} request
 * @param  {string} requestFail
 */
async function promptResponse(interaction, request, requestFail){
    await interaction.editReply(request, {fetchReply: true})
    let filter = m => m.author.id === interaction.member.user.id

    return interaction.channel.awaitMessages({ filter, max: 1, time: 20000, errors: ['time'] })
            .then(collected => {
                let response = collected.first().content;
                if (response !== null) { 
                    console.log('user interaction response:' + response);
                    return response;
                }
            })
            .catch(() => {
                return interaction.editReply(requestFail), console.log(requestFail)
            })
}

module.exports = promptResponse;

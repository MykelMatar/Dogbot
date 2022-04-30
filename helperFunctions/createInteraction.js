const util = require('minecraft-server-util'); 


/**
 * sends a message and collects the response
 * @param  {string} message
 * @param  {string} request
 */
function createInteraction(interaction, request, reject){
    interaction.editReply(request, { fetchReply: true })
    let filter = m => m.author.id === message.author.id

    return message.channel.awaitMessages({ filter, max: 1, time: 20000, errors: ['time'] })
            .then(collected => {
                let response = collected.first().content;
                if (response !== null) { 
                    console.log('user interaction response:' + response);
                    return response;
                }
            })
            .catch(error => {
                return message.reply(reject), console.log(reject)
            })
}

module.exports = createInteraction;

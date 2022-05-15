const { MessageActionRow, MessageButton } = require('discord.js');
const guilds = require("../schemas/guild-schema");

/**
 * sends a message and collects the response
 * @param  client
 * @param  message
 * @param  guildName
 */

async function autoDetectRole(client, message, guildName) {
    
    // Create button interaction to enlist members of a specific role (role can be set with /setrole-autoenlist)
    const currentGuild = await guilds.find({guildId: message.guildId})
    let selectedRole = currentGuild[0].ServerData.roles.autoenlist
    
    if (selectedRole == null) return console.log('no autoenlist role') ; // return if no selected roll
    else if (message.content.includes(`${selectedRole}`)) {
        console.log('autoenlist role detected');
        // generate buttons
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('Yes')
                    .setLabel('Yes')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('No')
                    .setLabel('No')
                    .setStyle('DANGER'),
            );

        let sent = await message.reply({ content: 'Would you like to enlist members for your event?', components: [row] })

        // create collector
        const filter = i => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 10000 }); // only message author can interact, 1 response, 10s timer 
        const command = client.commands.get('enlist-users'); // retrieve command for button

        // collect response and handle interaction
        collector.on('collect', async i => {
            if (i.customId === 'No') return collector.stop() 
            if (i.customId === 'Yes') {
                await command.execute(client, message);
                return collector.stop()
            }
        });

        collector.on('end', async collected => {
            await sent.delete();   // remove buttons
        });
    }
}

module.exports = autoDetectRole;
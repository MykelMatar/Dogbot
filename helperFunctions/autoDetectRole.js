const { MessageActionRow, MessageButton } = require('discord.js');
const data = require('../data.json');

/**
 * sends a message and collects the response
 * @param  {string} client
 * @param  {string} message
 * @param  {string} guildName
 */

async function autoDetectRole(client, message, guildName) {
    // Create button interaction to enlist members of a specific role (role can be set with !setrole)
    let selectedRole = data.Guilds[guildName].ServerData['roles'].autoenlist
    if (selectedRole == null) return; // return if no selected roll
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
        const collector = message.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', max: 1, time: 10000 }); // only message author can interact, 1 response, 10s timer 
        const command = client.commands.get('autoenlist-users'); // retrieve command for button

        // preventInteractionCollision(message, collector, sent)

        // collect response and handle interaction
        collector.on('collect', async i => {
            i.deferUpdate();
            if (i.customId === 'Yes')
                await command.execute(client, message, guildName);

        });

        collector.on('end', async collected => {
            console.log(`enlist prompt collected ${collected.size} button presses`)
            await sent.delete();   // remove buttons
        });
    }
}

module.exports = autoDetectRole;
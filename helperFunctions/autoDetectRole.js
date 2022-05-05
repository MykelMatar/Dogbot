const { MessageActionRow, MessageButton } = require('discord.js');
const data = require('../data.json');

async function autoDetectRole(client, message, guildName) {
    // Create button interaction to enlist members of a specific role (role can be set with !setrole)
    let selectedRole = data.Guilds[guildName].ServerData['selectedRole']

    if (selectedRole == null); // do nothing if there is no selected role
    else if (message.content.includes(`${selectedRole}`)) {

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
        const command = client.commands.get('autoenlist'); // retrieve command for button

        // preventInteractionCollision(message, collector, sent)

        // collect response
        collector.on('collect', async i => {
            i.deferUpdate();
            var execute;
            // interaction handling
            if (i.customId === 'Yes')
                execute = await command.execute(client, message, guildName);

        });

        collector.on('end', async collected => {
            console.log(`enlist prompt collected ${collected.size} button presses`)
            await sent.delete();   // remove buttons
        });
    }
}

module.exports = autoDetectRole;
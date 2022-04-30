const { clearInterval } = require('timers');
const { MessageActionRow, MessageButton } = require('discord.js');
const data = require('../../data.json');
// const refreshServerStatus = require('../../helperFunctions/refreshServerStatus');
const preventInteractionCollision = require('../../helperFunctions/preventInteractionCollision');
const writeToJson = require('../../helperFunctions/writeToJson');
const unpinEmbed = require('../../helperFunctions/unpinEmbed');





module.exports = async (client, message,) => {
    const PREFIX = '!';
    const args = message.content.slice(PREFIX.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    const command = client.commands.get(cmd);
    let guildName = message.guild.name.replace(/\s+/g, "");

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

        let sent = await message.reply({ content: 'Would you like to enlist members for your event?', ephemeral: true, components: [row] })

        // create collector
        const filter = i => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', max: 1, time: 10000 }); // only message author can interact, 1 response, 10s timer 
        const command = client.commands.get('enlist'); // retrieve command for button

        preventInteractionCollision(message, collector, sent)

        // collect response
        collector.on('collect', async i => {
            var execute;
            // interaction handling
            if (i.customId === 'Yes') 
                execute = await command.execute(client, message, args, guildName);
            
        });

        collector.on('end', async collected => {
            console.log(`enlist prompt collected ${collected.size} button presses`)
            await sent.delete();   // remove buttons
        });
    }
    
    // command execution
    // *unless description states otherwise, commands that end with mc require admin perms
    // if (!message.content.startsWith(PREFIX)) return;

    // if (command) command.execute(client, message, args, guildName);
}


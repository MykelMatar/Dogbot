const { MessageActionRow, MessageEmbed, MessageButton } = require('discord.js');
const data = require('../data.json');
const writeToJson = require('../helperFunctions/writeToJson');
const generateMenuOptions = require('../helperFunctions/generateMenuOptions');
const { userInfo } = require('os');

let cmdStatus = 0;



module.exports = {
    name: 'enlist',
    description: 'creates interaction to enlist other users for event/group',
    async execute(client, message, args, guildName) {

        // generate buttons
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('Enlist')
                    .setLabel('Enlist')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('Reject')
                    .setLabel('Reject')
                    .setStyle('DANGER'),
            );


        // generate embed
        const embed = new MessageEmbed()
            .setTitle('Registered Users')
            .addFields(
                { name: 'Enlisted', value: '-', inline: true },               // Discord.js v13 requires manual call of toString on all methods
                { name: 'Not Enlisted', value: '-', inline: true },
            )
            .setColor("#8570C1")

        let sent = await message.reply({ embeds: [embed], components: [row] })
        const newEmbed = new MessageEmbed(embed); // create new embed to edit existing embed later


        // create collector
        // const filter = i => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 20000 }); // only message author can interact, 1 response, 10s timer 
        const msgCollector = message.channel.createMessageCollector({ time: 20000 })

        /** 
         * prevent other button interactions occuring simultaneously 
         * not using preventInteractionCollision because that function rewrites the last sent message to indicate an aborted command.
         * this is not a behavior we want for !mc or !listmc since they display pertinent information
         */
        msgCollector.on('collect', async m => {
            if (m.content == '!mc' || m.content == '!listmc') {
                msgCollector.stop();
                collector.stop();
                await sent.edit({ components: [] })
            }
        });

        // collect response
        var enlistedUsers = ['-'];
        var rejectedUsers = ['-'];

        collector.on('collect', async i => {
            // interaction handling
            if (i.customId === 'Enlist') {
                if (!enlistedUsers.includes('> ' + i.user.username)) enlistedUsers.push('> ' + i.user.username) // checks if user is in array 1 before adding them
                if (!(enlistedUsers.includes('-')) && enlistedUsers.length == 0) { enlistedUsers.push('-') } // makes sure array 1 is never empty
                if (rejectedUsers.includes('> ' + i.user.username)) { rejectedUsers.splice(rejectedUsers.indexOf('> ' + i.user.username), 1) } // removes user from other array to ensure there are no duplicates
                if (!(rejectedUsers.includes('-')) && rejectedUsers.length == 0) { rejectedUsers.push('-') } //makes sure array 2 is never empty
                if (enlistedUsers.length > 1 && enlistedUsers.includes('-')) {  //removes extra dash if a user is in the array
                    enlistedUsers.splice(enlistedUsers.indexOf('-'), 1)
                }
            }
            else if (i.customId === 'Reject') {
                if (!rejectedUsers.includes('> ' + i.user.username)) rejectedUsers.push(i.user.username) // checks if user is in array 1 before adding them
                if (!(rejectedUsers.includes('-')) && rejectedUsers.length == 0) { rejectedUsers.push('-') } // makes sure array 1 is never empty
                if (enlistedUsers.includes('> ' + i.user.username)) { enlistedUsers.splice(enlistedUsers.indexOf('> ' + i.user.username), 1) } // removes user from other array to ensure there are no duplicates
                if (!(enlistedUsers.includes('-')) && enlistedUsers.length == 0) { enlistedUsers.push('-') } //makes sure array 2 is never empty
                if (rejectedUsers.length > 1 && rejectedUsers.includes('-')) {  //removes extra dash if a user is in the array
                    rejectedUsers.splice(rejectedUsers.indexOf('-'), 1)
                }
            }

            newEmbed.fields[0].value = enlistedUsers;
            newEmbed.fields[1].value = rejectedUsers;
            await sent.edit({ embeds: [newEmbed], components: [row] });
        });

        collector.on('end', async collected => {
            console.log(`enlist collected ${collected.size} button presses`)
            await sent.edit({ embeds: [newEmbed]})   // remove buttons
        });
    }
}
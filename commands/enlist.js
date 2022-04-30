const { MessageActionRow, MessageEmbed, MessageButton, ButtonInteraction } = require('discord.js');
const data = require('../data.json');
const writeToJson = require('../helperFunctions/writeToJson');
const generateMenuOptions = require('../helperFunctions/generateMenuOptions');
const { userInfo } = require('os');
let cmdStatus = 0;




module.exports = {
    name: 'enlist',
    description: 'creates interaction to enlist other users for event/group',
    async execute(client, interaction, guildName) {
        console.log(`recruitment started by ${interaction.member.user.username}`);

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

        await interaction.reply({ embeds: [embed], components: [row] })

        // create collector
        const collector = interaction.channel.createMessageComponentCollector({ componentType: 'BUTTON'}); // only message author can interact, 1 response, 10s timer 
        const msgCollector = interaction.channel.createMessageCollector()
        let selectedRole = data.Guilds[guildName].ServerData['selectedRole']

        /** 
         * prevent other button interactions occuring simultaneously 
         * not using preventInteractionCollision because that function rewrites the last sent message to indicate an aborted command.
         * this is not a behavior we want for !mc or !listmc since they display pertinent information
         */
        // msgCollector.on('collect', async m => {
        //     if (m.content == '!mc' || m.content == '!listmc' || m.content == '!enlist' || m.content.includes(`${selectedRole}`)) {
        //         msgCollector.stop();
        //         collector.stop();
        //         await sent.edit({ components: [] })
        //     }
        // });

        // collect response
        var enlistedUsers = ['-'];
        var rejectedUsers = ['-'];

        collector.on('collect', async i => {
            i.deferUpdate(); // prevents "this interaction failed" message from appearing
            // interaction handling
            if (i.customId === 'Enlist') {
                if (!enlistedUsers.includes('> ' + i.user.username + '\n')) enlistedUsers.push('> ' + i.user.username + '\n') // checks if user is in array 1 before adding them
                if (!(enlistedUsers.includes('-')) && enlistedUsers.length == 0) { enlistedUsers.push('-') } // makes sure array 1 is never empty
                if (rejectedUsers.includes('> ' + i.user.username + '\n')) { rejectedUsers.splice(rejectedUsers.indexOf('> ' + i.user.username + '\n'), 1) } // removes user from other array to ensure there are no duplicates
                if (!(rejectedUsers.includes('-')) && rejectedUsers.length == 0) { rejectedUsers.push('-') } //makes sure array 2 is never empty
                if (enlistedUsers.length > 1 && enlistedUsers.includes('-')) {  //removes extra dash if a user is in the array
                    enlistedUsers.splice(enlistedUsers.indexOf('-'), 1)
                }
            }
            if (i.customId === 'Reject') {
                if (!rejectedUsers.includes('> ' + i.user.username + '\n')) rejectedUsers.push('> ' + i.user.username + '\n') // checks if user is in array 1 before adding them
                if (!(rejectedUsers.includes('-')) && rejectedUsers.length == 0) { rejectedUsers.push('-') } // makes sure array 1 is never empty
                if (enlistedUsers.includes('> ' + i.user.username + '\n')) { enlistedUsers.splice(enlistedUsers.indexOf('> ' + i.user.username + '\n'), 1) } // removes user from other array to ensure there are no duplicates
                if (!(enlistedUsers.includes('-')) && enlistedUsers.length == 0) { enlistedUsers.push('-') } //makes sure array 2 is never empty
                if (rejectedUsers.length > 1 && rejectedUsers.includes('-')) {  //removes extra dash if a user is in the array
                    rejectedUsers.splice(rejectedUsers.indexOf('-'), 1)
                }
            }

            embed.fields[0].value = enlistedUsers.join(''); // convert array into string seperated by spaces bc discord js 13 requires strings
            embed.fields[1].value = rejectedUsers.join('');
            await interaction.editReply({ embeds: [embed], components: [row] });
        });

        collector.on('end', async collected => {
            console.log(`enlist collected ${collected.size} button presses`)
            await interaction.editReply({ embeds: [embed]})   // remove buttons
        });
    }
}
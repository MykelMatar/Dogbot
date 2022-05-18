const {MessageActionRow, MessageEmbed, MessageButton} = require('discord.js');
const guilds = require("../../schemas/guild-schema");
const updateUserData = require("../../helperFunctions/general_helpers/updateUserData");
const updateEnlistUserArrays = require("../../helperFunctions/enlist_helpers/updateEnlistUserArrays");

module.exports = {
    name: 'enlist-users',
    description: 'creates message to enlist other users for event/group',
    async execute(client, message) {
        console.log(`recruitment started by ${message.member.user.username}`);

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
                {name: 'Enlisted', value: '-', inline: true},               // Discord.js v13 requires manual call of toString on all methods
                {name: 'Not Enlisted', value: '-', inline: true},
            )
            .setColor("#8570C1")

        let sent = await message.channel.send({embeds: [embed], components: [row]})

        // create collector
        const collector = message.channel.createMessageComponentCollector({componentType: 'BUTTON', time: 10000}); // only message author can interact, 1 response, 2 hour timer

        // collect response
        let enlistedUsers = ['-'];
        let enlistedUserIds = []; // for pushing user data to mongoDB
        let rejectedUsers = ['-'];
        let rejectedUserIds = [];

        collector.on('collect', async i => {
            await i.deferUpdate(); // prevents "this message failed" message from appearing
            await updateEnlistUserArrays(i, enlistedUsers, rejectedUsers, enlistedUserIds, rejectedUserIds)

            embed.fields[0].value = enlistedUsers.join('');
            embed.fields[1].value = rejectedUsers.join('');
            await sent.edit({embeds: [embed], components: [row]});
        });

        collector.on('end', async collected => {
            await sent.edit({content: 'enlisting ended', embeds: [embed]})   // remove buttons
            if (collected.size === 0) return // make sure users were collected
            
            await updateUserData(message, enlistedUserIds, 'enlist');
            await updateUserData(message, rejectedUserIds, 'reject');
        });
    }
}
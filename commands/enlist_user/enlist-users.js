const {MessageActionRow, MessageEmbed, MessageButton, User} = require('discord.js');
const guilds = require("../../schemas/guild-schema");

module.exports = {
    name: 'enlist-users',
    description: 'creates message to enlist other users for event/group',
    async execute(client, message) {
        console.log(`recruitment started by ${message.member.user.username}`);

        const currentGuild = await guilds.findOne({guildId: message.guildId})
        const UserData = currentGuild.UserData

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
        const collector = message.channel.createMessageComponentCollector({componentType: 'BUTTON', time: 5000}); // only message author can interact, 1 response, 2 hour timer

        // collect response
        let enlistedUsers = ['-'];
        let enlistedUserIds = []; // for pushing user data to mongoDB
        let rejectedUsers = ['-'];
        let rejectedUserIds = [];

        collector.on('collect', async i => {
            await i.deferUpdate(); // prevents "this message failed" message from appearing
            // message handling
            if (i.customId === 'Enlist') {
                if (!enlistedUsers.includes('> ' + i.user.username + '\n')) { // checks if user is in array 1 before adding them
                    enlistedUsers.push('> ' + i.user.username + '\n')
                    enlistedUserIds.push(i.user.id)
                }
                if (!(enlistedUsers.includes('-')) && enlistedUsers.length === 0) { // makes sure array 1 is never empty
                    enlistedUsers.push('-')
                }
                if (rejectedUsers.includes('> ' + i.user.username + '\n')) { // removes user from other array to ensure there are no duplicates
                    rejectedUsers.splice(rejectedUsers.indexOf('> ' + i.user.username + '\n'), 1)
                    rejectedUserIds.splice(rejectedUserIds.indexOf(i.user.id, 1))
                }
                if (!(rejectedUsers.includes('-')) && rejectedUsers.length === 0) { //makes sure array 2 is never empty
                    rejectedUsers.push('-')
                }
                if (enlistedUsers.length > 1 && enlistedUsers.includes('-')) {  //removes extra dash if a user is in the array
                    enlistedUsers.splice(enlistedUsers.indexOf('-'), 1)
                }
            }
            if (i.customId === 'Reject') {
                if (!rejectedUsers.includes('> ' + i.user.username + '\n')) rejectedUsers.push('> ' + i.user.username + '\n') // checks if user is in array 1 before adding them
                if (!(rejectedUsers.includes('-')) && rejectedUsers.length === 0) { // makes sure array 1 is never empty
                    rejectedUsers.push('-')
                    rejectedUserIds.push(i.user.id)
                }
                if (enlistedUsers.includes('> ' + i.user.username + '\n')) { // removes user from other array to ensure there are no duplicates
                    enlistedUsers.splice(enlistedUsers.indexOf('> ' + i.user.username + '\n'), 1)
                    enlistedUserIds.splice(rejectedUserIds.indexOf(i.user.id, 1))
                }
                if (!(enlistedUsers.includes('-')) && enlistedUsers.length === 0) { //makes sure array 2 is never empty
                    enlistedUsers.push('-')
                }
                if (rejectedUsers.length > 1 && rejectedUsers.includes('-')) {  //removes extra dash if a user is in the array
                    rejectedUsers.splice(rejectedUsers.indexOf('-'), 1)
                }
            }

            embed.fields[0].value = enlistedUsers.join(''); // convert array into string seperated by spaces bc discord js 13 requires strings
            embed.fields[1].value = rejectedUsers.join('');
            await sent.edit({embeds: [embed], components: [row]});
        });

        collector.on('end', async collected => {
            await sent.edit({content: 'enlisting ended', embeds: [embed]})   // remove buttons
            if (collected.size === 0) return // make sure users were collected

            enlistedUserIds.forEach((userIds, index) => {
                if (!(UserData.some(user => user.id === enlistedUserIds[index]))) { // create user data if it doesnt exist
                    let username = message.guild.members.cache.get(`${enlistedUserIds[index]}`).user.username
                    UserData.push({
                        username: username, 
                        id: enlistedUserIds[index], 
                        tttStats: {
                            wins: 0,
                            losses: 0
                        },
                        enlistStats: {
                            enlists: 1,
                            rejects: 0
                        }
                    })
                }
                else { // if it does exist, update it
                    enlistedUserIds.forEach((userIds, index) => {
                        if (enlistedUserIds[index] === UserData[index].id){
                            UserData[index].enlistStats.enlists ++ 
                        } 
                    });
                }
                
                // repeat for rejected users
                enlistedUserIds.forEach((userIds, index) => {
                    if (!(UserData.some(user => user.id === enlistedUserIds[index]))) { // create user data if it doesnt exist
                        let username = message.guild.members.cache.get(`${enlistedUserIds[index]}`).user.username
                        UserData.push({
                            username: username,
                            id: enlistedUserIds[index],
                            tttStats: {
                                wins: 0,
                                losses: 0
                            },
                            enlistStats: {
                                enlists: 0,
                                rejects: 1
                            }
                        })
                    }
                    else {
                        rejectedUserIds.forEach((userIds, index) => {
                            if (rejectedUserIds[index] === UserData[index].id) {
                                UserData[index].enlistStats.enlists++
                            }
                        });
                    }
                });
            })
            await currentGuild.save()
         });
    }
}
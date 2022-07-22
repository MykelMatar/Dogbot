import {Command} from "../../dependencies/classes/Command";
import {Message, MessageActionRow, MessageButton, MessageEmbed} from "discord.js";
import {updateEnlistUserArrays} from "../../dependencies/helpers/updateEnlistUserArrays";
import {StatName, updateUserData} from "../../dependencies/helpers/updateUserData";

export const enlistUsers = new Command(
    'enlist-users',
    'creates message embed with buttons to enlist other users for event/group',
    async (client, message) => {

        const userData = enlistUsers.guildData.UserData
        
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('Gamer')
                    .setLabel('Be Gamer')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('Perhaps')
                    .setLabel('Perhaps')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('Cringe')
                    .setLabel('Be Cringe')
                    .setStyle('DANGER'),
            );

        // generate embed
        const embed = new MessageEmbed()
            .setTitle('Registered Gamers')
            .addFields(
                {name: 'Gaming⠀⠀⠀', value: '-', inline: true},
                {name: 'Perhaps', value: '-', inline: true},
                {name: 'Not Gaming', value: '-', inline: true},
            )
            .setFooter({text: 'Selecting the "Perhaps" option will not count towards your enlist stats',})
            .setColor("#8570C1")

        let sent: Message = await message.channel.send({embeds: [embed], components: [row]})

        const collector = message.channel.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 5000
        }); // only message author can interact, 1 response, 3 hour (1.08e+7) timer


        let enlistedUsers: string[] = ['-'],
            enlistedUserIds: string[] = [], // for pushing user data to mongoDB
            rejectedUsers: string[] = ['-'],
            rejectedUserIds: string[] = [],
            potentialUsers: string[] = ['-'],
            potentialUserIds: string[] = [],
            ignoredUserIds: string[] = []
        let userArrays = [enlistedUsers, enlistedUserIds, rejectedUsers, rejectedUserIds, potentialUsers, potentialUserIds] // makes it easier to pass to 'update' function   

        collector.on('collect', async i => {
            if (i.customId === 'Gamer' || i.customId === 'Cringe' || i.customId === 'Perhaps') {
                await i.deferUpdate(); // prevents "this message failed" message from appearing
                await updateEnlistUserArrays(i, userArrays)

                embed.fields[0].value = enlistedUsers.join('');
                embed.fields[1].value = potentialUsers.join('');
                embed.fields[2].value = rejectedUsers.join('');
                await sent.edit({embeds: [embed], components: [row]});
            }
        });

        collector.on('end', async collected => {
            await sent.edit({content: '⚠ ***ENLISTING ENDED*** ⚠', embeds: [embed], components: []})
            if (collected.size === 0) return // make sure users were collected

            let allUserIds: string[] = [],
                allRegisteredUserIds: string[] = []
            for (const user of userData) {
                allUserIds.push(user.id)
            }
            
            enlistedUserIds.forEach(id => allRegisteredUserIds.push(id))
            rejectedUserIds.forEach(id => allRegisteredUserIds.push(id))
            potentialUserIds.forEach(id => allRegisteredUserIds.push(id))
            
            ignoredUserIds = allUserIds.filter(id => !(allRegisteredUserIds.includes(id)))
            
            await updateUserData(message, enlistedUserIds, StatName.enlist);
            await updateUserData(message, rejectedUserIds, StatName.reject);
            await updateUserData(message, ignoredUserIds, StatName.ignore);
        });
    })
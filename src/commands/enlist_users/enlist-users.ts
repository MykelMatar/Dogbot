import {Command} from "../../dependencies/classes/Command";
import {InteractionCollector, Message, MessageActionRow, MessageButton, MessageEmbed} from "discord.js";
import {updateEnlistUserArrays} from "../../dependencies/helpers/updateEnlistUserArrays";
import {StatName, updateUserData} from "../../dependencies/helpers/updateUserData";

export const enlistUsers = new Command(
    'enlist-users',
    'creates message embed with buttons to enlist other users for event/group', 
    async (client, message) => {
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
        .setTitle('Registered Gamers')
        .addFields(
            {name: 'Gaming', value: '-', inline: true},               // Discord.js v13 requires manual call of toString on all methods
            {name: 'Not Gaming', value: '-', inline: true},
        )
        .setColor("#8570C1")

    let sent: Message = await message.channel.send({embeds: [embed], components: [row]})

    // create collector
    const collector: InteractionCollector<any> = message.channel.createMessageComponentCollector({componentType: 'BUTTON', time: 1.08e+7}); // only message author can interact, 1 response, 3 hour (1.08e+7) timer

    // collect response
    let enlistedUsers: string[] = ['-'];
    let enlistedUserIds: string[] = []; // for pushing user data to mongoDB
    let rejectedUsers: string[] = ['-'];
    let rejectedUserIds: string[] = [];

    collector.on('collect', async i => {
        if(i.customId === 'Enlist' ||  i.customId === 'Reject') {
            await i.deferUpdate(); // prevents "this message failed" message from appearing
            await updateEnlistUserArrays(i, enlistedUsers, rejectedUsers, enlistedUserIds, rejectedUserIds)

            embed.fields[0].value = enlistedUsers.join('');
            embed.fields[1].value = rejectedUsers.join('');
            await sent.edit({embeds: [embed], components: [row]});
        }
    });
    
    collector.on('end', async collected => {
        await sent.edit({content: 'ENLISTING ENDED', embeds: [embed], components: []})   // remove buttons
        if (collected.size === 0) return // make sure users were collected

        await updateUserData(message, enlistedUserIds, StatName.enlist);
        await updateUserData(message, rejectedUserIds, StatName.reject);
    });
})
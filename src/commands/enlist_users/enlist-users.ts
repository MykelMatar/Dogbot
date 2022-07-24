import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle,
    CommandInteraction, ComponentType, EmbedBuilder, Message, SlashCommandBuilder} from "discord.js";
import {newClient} from "../../dependencies/myTypes";
import {updateEnlistUserArrays} from "../../dependencies/helpers/updateEnlistUserArrays";
import {StatName, updateUserData} from "../../dependencies/helpers/updateUserData";
import {log} from "../../dependencies/logger";

export const enlistUsers = {
    data: new SlashCommandBuilder()
        .setName('enlist-users')
        .setDescription('creates prompt that allows users to RSVP for events')
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description of the event')
                .setRequired(false)),

    async execute(client: newClient, message: CommandInteraction | Message, guildData) {
        const userData = guildData.UserData

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Gamer')
                    .setLabel('Be Gamer')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('Perhaps')
                    .setLabel('Perhaps')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('Cringe')
                    .setLabel('Be Cringe')
                    .setStyle(ButtonStyle.Danger),
            );

        // generate embed
        const file = new AttachmentBuilder('./src/dependencies/images/Dogbot.png')
        const embed = new EmbedBuilder()
            // .setTitle('Registered Gamers')
            .setThumbnail('attachment://Dogbot.png')
            .addFields(
                {name: 'Gaming⠀⠀⠀', value: '-', inline: true},
                {name: 'Perhaps', value: '-', inline: true},
                {name: 'Not Gaming', value: '-', inline: true},
            )
            .setColor("#8570C1")
            .setFooter({text: 'Selecting the "Perhaps" option will not count towards your enlist stats',})

        await message.reply({content: '*Prompt sent*', ephemeral: true})
        let sent: Message = await message.channel.send({embeds: [embed], files: [file], components: [row]})

        const collector = message.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 1.08e+7 // 3 hour (1.08e+7) timer
        });


        let enlistedUsers: string[] = ['-'],
            enlistedUserIds: string[] = [], // for pushing user data to mongoDB
            rejectedUsers: string[] = ['-'],
            rejectedUserIds: string[] = [],
            potentialUsers: string[] = ['-'],
            potentialUserIds: string[] = [],
            ignoredUserIds: string[] = []
        let userArrays = [enlistedUsers, enlistedUserIds, rejectedUsers, rejectedUserIds, potentialUsers, potentialUserIds] // makes it easier to pass to 'update' function   

        try {
            collector.on('collect', async i => {
                if (i.customId === 'Gamer' || i.customId === 'Cringe' || i.customId === 'Perhaps') {
                    await i.deferUpdate(); // prevents "this message failed" message from appearing
                    await updateEnlistUserArrays(i, userArrays)

                    embed.data.fields[0].value = enlistedUsers.join('');
                    embed.data.fields[1].value = potentialUsers.join('');
                    embed.data.fields[2].value = rejectedUsers.join('');
                    await sent.edit({embeds: [embed], components: [row]});
                }
            });
        } catch (e) {
            await sent.edit({
                content: '*error while collecting responses, please try again*',
                embeds: [embed],
                components: []
            });
            log.error(e)
        }

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
    }
}
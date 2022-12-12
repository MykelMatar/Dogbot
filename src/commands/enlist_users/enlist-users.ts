import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CommandInteraction,
    CommandInteractionOption,
    ComponentType,
    EmbedBuilder,
    InteractionCollector,
    Message,
    Role,
    SlashCommandBuilder
} from "discord.js";
import {EnlistUserInfoArrays, NewClient} from "../../dependencies/myTypes";
import {updateEnlistUserArrays} from "../../dependencies/helpers/updateEnlistUserArrays";
import {StatName, updateUserData} from "../../dependencies/helpers/updateUserData";
import log from "../../dependencies/logger";
import {terminationListener} from "../../dependencies/helpers/terminationListener";
import guilds from "../../dependencies/schemas/guild-schema";

export const enlistUsers = {
    data: new SlashCommandBuilder()
        .setName('enlist-users')
        .setDescription('creates prompt that allows users to RSVP for events')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title of the event')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to @ when sending this prompt. Can be set automatically via the /enlist-set-role')
                .setRequired(false)
        ),
    // cooldown: 10800, // 3 hour cooldown to match the 3 hour enlist timer
    async execute(client: NewClient, interaction: CommandInteraction, guildData) {
        await interaction.reply({content: '*prompt sent*', ephemeral: true})
        const userData = guildData.UserData

        // retrieve parameters
        let title: string, role: Role | string
        const defaultTitle: string = `Gamer Time`
        let titleOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'title')
        let roleOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'role')

        if (titleOption != undefined) {
            title = titleOption.value as string
        } else {
            title = defaultTitle
        }
        if (roleOption != undefined) {
            role = roleOption.value as string | Role
        } else {
            const currentGuild = await guilds.findOne({guildId: interaction.guildId})
            let selectedRole = currentGuild.ServerData.roles.autoenlist
            role = interaction.guild.roles.cache.find(r => r.id === selectedRole)
            if (role == undefined) {
                role = ''
            }
        }

        // create buttons and embed
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Gamer')
                    .setLabel('Gaming')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('Perhaps')
                    .setLabel('Perhaps')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('Cringe')
                    .setLabel('Disappointment')
                    .setStyle(ButtonStyle.Danger),
            );
        const file = new AttachmentBuilder('./src/dependencies/images/Dogbot.png')
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setThumbnail('attachment://Dogbot.png')
            .addFields(
                {name: 'Gaming', value: '-', inline: true},
                {name: 'Perhaps', value: '-', inline: true},
                {name: 'Not Gaming', value: '-', inline: true},
            )
            .setColor('#B8CAD1')
            .setFooter({text: 'Selecting the "Perhaps" option will not count towards your enlist stats',})

        // send prompt. Not an interaction reply bc interactions are only editable for 15 min
        let enlistPrompt: Message = await interaction.channel.send({
            content: `${role}`,
            embeds: [embed],
            files: [file],
            components: [row]
        })

        let userArrays: EnlistUserInfoArrays = {
            enlistedUsers: ['-'],
            enlistedUserIds: [], // for pushing user data to mongoDB
            rejectedUsers: ['-'],
            rejectedUserIds: [],
            potentialUsers: ['-'],
            potentialUserIds: [],
            ignoredUserIds: [],
        }

        // create collector and run
        const collector: InteractionCollector<ButtonInteraction> = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 1.08e+7 // 3 hour (1.08e+7) timer
        });

        try {
            //@ts-ignore (typescipt thinks .custom_id property does not exist)
            let button1CustomId = row.components[0].data.custom_id
            //@ts-ignore
            let button2CustomId = row.components[1].data.custom_id
            //@ts-ignore
            let button3CustomId = row.components[2].data.custom_id
            collector.on('collect', async i => {
                if (i.message.id != enlistPrompt.id) return // prevent simultaneous prompt from affecting each other
                if (i.customId === button1CustomId || i.customId === button2CustomId || i.customId === button3CustomId) {
                    await i.deferUpdate(); // prevents "this interaction failed" interaction from appearing
                    await updateEnlistUserArrays(i, userArrays)

                    embed.data.fields[0].value = userArrays.enlistedUsers.join('');
                    embed.data.fields[1].value = userArrays.potentialUsers.join('');
                    embed.data.fields[2].value = userArrays.rejectedUsers.join('');
                    await enlistPrompt.edit({content: `${role}`, embeds: [embed], components: [row]});
                }
            }); // collector 
        } catch (e) {
            await enlistPrompt.edit({
                content: '*error while collecting responses, please try again*',
                embeds: [embed],
                components: [],
            });
            log.error(e)
        }

        collector.on('end', async collected => {
            await enlistPrompt.edit({content: '⚠ ***ENLISTING ENDED*** ⚠', embeds: [embed], components: []})
            if (collected.size === 0) return // make sure users were collected

            let allUserIds: string[] = [],
                allRegisteredUserIds: string[] = []
            for (const user of userData) {
                allUserIds.push(user.id)
            }

            userArrays.enlistedUserIds.forEach(id => allRegisteredUserIds.push(id))
            userArrays.rejectedUserIds.forEach(id => allRegisteredUserIds.push(id))
            userArrays.potentialUserIds.forEach(id => allRegisteredUserIds.push(id))
            userArrays.ignoredUserIds = allUserIds.filter(id => !(allRegisteredUserIds.includes(id)))

            await updateUserData(interaction, userArrays.enlistedUserIds, StatName.enlist);
            await updateUserData(interaction, userArrays.rejectedUserIds, StatName.reject);
            await updateUserData(interaction, userArrays.ignoredUserIds, StatName.ignore);
        });

        let terminate: boolean = false
        await terminationListener(client, collector, terminate)
    }
}
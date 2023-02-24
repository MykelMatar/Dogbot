import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Collection,
    CommandInteraction,
    CommandInteractionOption,
    ComponentType,
    EmbedBuilder,
    InteractionCollector,
    Message,
    Role,
    SlashCommandBuilder,
    StringSelectMenuInteraction
} from "discord.js";
import {embedColor, EnlistUserData, GuildSchema, NewClient, UserStats} from "../../dependencies/myTypes";
import {updateEnlistUserEmbed} from "../../dependencies/helpers/updateEnlistUserEmbed";
import {updateUserData} from "../../dependencies/helpers/updateUserData";
import log from "../../dependencies/logger";
import guilds from "../../dependencies/schemas/guild-schema";
import {terminate, terminationListener} from "../../dependencies/helpers/terminationListener";

//TODO maybe add a Gaming Squad embed after the collector ends that displays everyone who registered
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
        )
        .addRoleOption(option =>
            option.setName('minimum')
                .setDescription('minimum number of gamers required to game')
                .setRequired(false)
        ),
    // cooldown: 10800, // 3 hour cooldown to match the 3 hour enlist timer
    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema) {
        await interaction.reply({content: 'prompt sent', ephemeral: true})
        const userData = guildData.UserData

        // retrieve parameters
        let title: string, role: Role | string, minimumNumberOfGamers: number
        const defaultTitle: string = `Gamer Time`
        const defaultAmount: number = 5
        let titleOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'title')
        let roleOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'role')
        let amountOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'minimum')

        if (titleOption != undefined) {
            title = titleOption.value as string
        } else {
            title = defaultTitle
        }
        if (amountOption != undefined) {
            minimumNumberOfGamers = amountOption.value as number
        } else {
            minimumNumberOfGamers = defaultAmount
        }
        if (roleOption != undefined) {
            role = roleOption.value as string | Role
            role = `<@&${role}>` // discord API format to @role
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
            .setTitle(`${title} (need ${minimumNumberOfGamers})`)
            .setThumbnail('attachment://Dogbot.png')
            .addFields(
                {name: 'Gaming', value: '-', inline: true},
                {name: 'Perhaps', value: '-', inline: true},
                {name: 'Not Gaming', value: '-', inline: true},
            )
            .setColor(embedColor)
            .setFooter({text: 'Selecting the "Perhaps" option will not count towards your enlist stats',})

        // send prompt. Not an interaction reply bc interactions are only editable for 15 min
        let enlistPrompt: Message = await interaction.channel.send({
            content: `${role}`,
            embeds: [embed],
            files: [file],
            components: [row]
        })
        let enlistUserData: EnlistUserData = {
            enlistedUsers: ['-'],
            enlistedUserIds: [],
            rejectedUsers: ['-'],
            rejectedUserIds: [],
            potentialUsers: ['-'],
            potentialUserIds: [],
            ignoredUserIds: [],
            userAvailabilityMap: new Collection()
        }

        const enlistCollector: InteractionCollector<ButtonInteraction> = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 1.08e+7 // 3 hour (1.08e+7) timer
        });
        let terminateBound = terminate.bind(null, client, enlistCollector)
        await terminationListener(client, enlistCollector, terminateBound)

        try {
            let gamingButtonId = row.components[0].data["custom_id"]
            let perhapsButtonId = row.components[1].data["custom_id"]
            let rejectButtonId = row.components[2].data["custom_id"]
            enlistCollector.on('collect', async i => {
                if (i.message.id != enlistPrompt.id) return // prevent simultaneous prompt from affecting each other
                if (i.customId === gamingButtonId || i.customId === perhapsButtonId || i.customId === rejectButtonId) {
                    if (i.customId === perhapsButtonId && !(enlistUserData.potentialUserIds.includes(i.user.id))) {
                        await i.reply({
                            content: 'please select your availability',
                            components: [require('../../dependencies/timeDropdownMenu').timeMenu],
                            ephemeral: true
                        })
                        const timeCollector: InteractionCollector<StringSelectMenuInteraction> = interaction.channel.createMessageComponentCollector({
                            componentType: ComponentType.SelectMenu,
                            time: 20000,
                            max: 1
                        });
                        timeCollector.on('collect', async j => {
                            // if (j.message.id != timeSelectPrompt.id ) return
                            if (j.customId !== 'time') return
                            let guildMember = j.user.username
                            let index = enlistUserData.potentialUsers.findIndex(user => user == `> ${guildMember}\n`)
                            enlistUserData.userAvailabilityMap.set(j.user.id, j.values[0])
                            enlistUserData.potentialUsers[index] = `> ${guildMember} ~${j.values[0]}\n`
                        })
                        timeCollector.on('end', async collected => {
                            if (collected.size == 0) {
                                enlistUserData.userAvailabilityMap.set(i.user.id, 'Not sure')
                            }
                            await updateEnlistUserEmbed(i, embed, enlistUserData, enlistPrompt, row, role)
                            await i.deleteReply()
                        })
                    } else {
                        await i.deferUpdate(); // prevents "this interaction failed" interaction from appearing
                        await updateEnlistUserEmbed(i, embed, enlistUserData, enlistPrompt, row, role)
                    }
                }
            });
        } catch (e) {
            await enlistPrompt.edit({
                content: 'error while collecting responses, please try again',
                embeds: [embed],
                components: [],
            });
            log.error(e)
        }

        enlistCollector.on('end', async collected => {
            if (enlistUserData.enlistedUserIds.length != 0) {
                const summonButton = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('Summon')
                            .setLabel('Summon Gamers')
                            .setStyle(ButtonStyle.Success),
                    );
                await enlistPrompt.edit({
                    content: '⚠ ***ENLISTING ENDED*** ⚠',
                    embeds: [embed],
                    components: [summonButton]
                })
                const summonCollector: InteractionCollector<ButtonInteraction> = interaction.channel.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: (1.08e+7), // 3 hour (1.08e+7 ms) timer
                    max: 1
                });
                summonCollector.on('collect', async i => {
                    if (i.customId === summonButton.components[0].data["custom_id"]) {
                        let enlistedUsers = enlistUserData.enlistedUserIds
                        enlistedUsers.forEach((user, index) => {
                            enlistedUsers[index] = `<@${user}>`
                        })
                        let potentialUsers = enlistUserData.potentialUserIds
                        potentialUsers.forEach((user, index) => {
                            potentialUsers[index] = `<@${user}>`
                        })
                        if (enlistUserData.enlistedUserIds.length == 1) {
                            i.channel.send({content: `lol ${enlistedUsers.join(',')} has no friends (except maybe ${potentialUsers.join(',')})`})
                        } else if (enlistUserData.enlistedUserIds.length == minimumNumberOfGamers) {
                            i.channel.send({content: `${enlistedUsers.join(',')}(and maybe ${potentialUsers.join(',')}): Gamer Time is upon us `})
                        } else if (enlistUserData.enlistedUserIds.length + enlistUserData.potentialUserIds.length >= minimumNumberOfGamers) {
                            i.channel.send({content: `${enlistedUsers.join(',')}: You have ${minimumNumberOfGamers} gamers if ${potentialUsers.join(',')} play`})
                        } else {
                            i.channel.send({content: `${enlistedUsers.join(',')}: Insufficient Gamers`})
                        }
                    }

                })
                summonCollector.on('end', async () => {
                    await enlistPrompt.edit({content: '⚠ ***ENLISTING ENDED*** ⚠', embeds: [embed], components: []})
                })
            }
            process.removeListener('SIGINT', terminateBound)
            if (collected.size === 0) return

            // logic to get users who ignored the enlist prompt for ignore% stat
            let guildMemberIds: string[] = [], // all users who have data in MongoDB
                enlistPromptUserIds: string[] = [] // all users who interacted with enlist prompt
            for (const user of userData) {
                guildMemberIds.push(user.id)
            }
            enlistUserData.enlistedUserIds.forEach(id => enlistPromptUserIds.push(id))
            enlistUserData.rejectedUserIds.forEach(id => enlistPromptUserIds.push(id))
            enlistUserData.potentialUserIds.forEach(id => enlistPromptUserIds.push(id))
            enlistUserData.ignoredUserIds = guildMemberIds.filter(id => !(enlistPromptUserIds.includes(id)))

            await updateUserData(interaction, enlistUserData.enlistedUserIds, UserStats.enlist);
            await updateUserData(interaction, enlistUserData.rejectedUserIds, UserStats.reject);
            await updateUserData(interaction, enlistUserData.ignoredUserIds, UserStats.ignore);

        });
    }
}
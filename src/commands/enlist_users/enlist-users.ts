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
    SlashCommandBuilder
} from "discord.js";
import {embedColor, EnlistUserData, GuildSchema, NewClient, UserStats} from "../../dependencies/myTypes";
import {updateEnlistUserEmbed} from "../../dependencies/helpers/updateEnlistUserEmbed";
import guilds from "../../dependencies/schemas/guild-schema";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/terminationListener";
import {updateUserData} from "../../dependencies/helpers/updateUserData";

//TODO add edit button to edit fields
export const enlistUsers = {
    data: new SlashCommandBuilder()
        .setName('enlist-users')
        .setDescription('creates prompt that allows users to RSVP for events')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('Game to be played')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('minimum')
                .setDescription('minimum number of gamers required to game')
                .setRequired(true)
                .setMaxValue(9999)
                .setMinValue(1)
        )
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
    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema) {
        await interaction.reply({content: 'prompt sent', ephemeral: true})
        const userData = guildData.UserData

        // retrieve parameters
        const {value: title = 'Gamer Time'} = (interaction.options.data.find(option => option.name === 'title') ?? {}) as CommandInteractionOption;
        const {value: game} = (interaction.options.data.find(option => option.name === 'game') ?? {}) as CommandInteractionOption;
        const {value: roleId} = (interaction.options.data.find(option => option.name === 'role') ?? {}) as CommandInteractionOption;
        const {value: minGamers = 5} = (interaction.options.data.find(option => option.name === 'minimum') ?? {}) as CommandInteractionOption;

        let role: string = ''
        if (roleId) {
            const selectedRole = interaction.guild.roles.cache.get(roleId as string);
            if (selectedRole) {
                role = `<@&${selectedRole.id}>`;
            }
        } else {
            const currentGuild = await guilds.findOne({guildId: interaction.guildId});
            const selectedRoleId = currentGuild.ServerData.roles.autoenlist;
            const selectedRole = interaction.guild.roles.cache.get(selectedRoleId);
            if (selectedRole) {
                role = `<@&${selectedRole.id}>`;
            }
        }

        // create buttons and embed
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`✓`)
                    .setCustomId('Gamer')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel(`✘`)
                    .setCustomId('Cringe')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel(`❔`)
                    .setCustomId('Perhaps')
                    .setStyle(ButtonStyle.Primary),
            );

        const file = new AttachmentBuilder('./src/dependencies/images/Dogbot.png')
        const embed = new EmbedBuilder()
            .setTitle(`${title}`)
            .setDescription(`need ${minGamers} for ${game}`)
            // .setThumbnail('attachment://Dogbot.png')
            .addFields(
                {name: 'Gaming', value: '-', inline: true},
                {name: 'Not Gaming', value: '-', inline: true},
                {name: 'Perhaps', value: '-', inline: true},
            )
            .setColor(embedColor)
            .setFooter({text: 'Selecting the "Perhaps" option will not count towards your enlist stats',})

        // send prompt. Not an interaction reply bc interactions are only editable for 15 min
        let enlistPrompt: Message = await interaction.channel.send({
            content: `${role}`,
            embeds: [embed],
            // files: [file],
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

        const gamingButtonId = row.components[0].data["custom_id"]
        const rejectButtonId = row.components[1].data["custom_id"]
        const perhapsButtonId = row.components[2].data["custom_id"]

        const enlistCollector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 1.08e+7, // 3 hour (1.08e+7) timer
            filter: (i) => {
                if (i.message.id != enlistPrompt.id) return false // prevent simultaneous prompts from affecting each other
                return [gamingButtonId, perhapsButtonId, rejectButtonId].includes(i.customId);
            },
        });
        let terminateBound = terminate.bind(null, client, enlistCollector)
        await terminationListener(client, enlistCollector, terminateBound)

        enlistCollector.on('collect', async i => {
            const isPerhapsButton = i.customId === perhapsButtonId;

            if (isPerhapsButton && !(enlistUserData.potentialUserIds.includes(i.user.id))) {
                // Send a time menu for the user to select their availability
                await i.reply({
                    content: 'please select your availability',
                    components: [require('../../dependencies/timeDropdownMenu').timeMenu],
                    ephemeral: true
                })

                const timeCollector = interaction.channel.createMessageComponentCollector({
                    componentType: ComponentType.SelectMenu,
                    time: 5000,
                    max: 1,
                    filter: (i) => i.customId === 'time',
                });

                // Update the user's availability when they select a time
                timeCollector.on('collect', async j => {
                    const guildMember = j.user.username
                    const index = enlistUserData.potentialUsers.findIndex(user => user == `> ${guildMember}\n`)
                    enlistUserData.userAvailabilityMap.set(j.user.id, j.values[0])
                    enlistUserData.potentialUsers[index] = `> ${guildMember} ~${j.values[0]}\n`
                });

                timeCollector.on('end', async collected => {
                    const updateEmbed = updateEnlistUserEmbed(i, embed, enlistUserData, enlistPrompt, row, role)
                    const deleteReply = i.deleteReply()
                    // If the user doesn't select a time, mark them as "not sure"
                    if (collected.size === 0) {
                        enlistUserData.userAvailabilityMap.set(i.user.id, 'Not sure')
                    }
                    await Promise.all([updateEmbed, deleteReply])
                });
            } else {
                // Defer the interaction update to prevent the "this interaction failed" message
                const deferUpdate = i.deferUpdate();
                const updateEmbed = updateEnlistUserEmbed(i, embed, enlistUserData, enlistPrompt, row, role)

                await Promise.all([deferUpdate, updateEmbed])
            }

        });

        enlistCollector.on('end', async collected => {
            removeTerminationListener(terminateBound)
            if (collected.size === 0) return
            // logic to get users who ignored the enlist prompt for ignore% stat
            const allUserIds = userData.map(user => user.id).flat();
            const allEnlistPromptUserIds = [...enlistUserData.enlistedUserIds, ...enlistUserData.rejectedUserIds, ...enlistUserData.potentialUserIds];
            enlistUserData.ignoredUserIds = allUserIds.filter(id => !allEnlistPromptUserIds.includes(id));

            const updateEnlistedUserData = updateUserData(interaction, enlistUserData.enlistedUserIds, UserStats.enlist);
            const updateRejectedUserData = updateUserData(interaction, enlistUserData.rejectedUserIds, UserStats.reject);
            const updateIgnoredUserData = updateUserData(interaction, enlistUserData.ignoredUserIds, UserStats.ignore);
            const updatePrompt = enlistPrompt.edit({content: '⚠ ***ENLISTING ENDED*** ⚠', components: []});

            await Promise.all([updateEnlistedUserData, updateRejectedUserData, updateIgnoredUserData, updatePrompt])

            // summon gamers button
            if (enlistUserData.enlistedUserIds.length == 0) return

            const formatUserMentions = (userIds: string[]): string[] => {
                return userIds.map(id => `<@${id}>`);
            };

            const enlistedUsers = formatUserMentions(enlistUserData.enlistedUserIds);
            const potentialUsers = formatUserMentions(enlistUserData.potentialUserIds);

            const summonButton = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('Summon')
                        .setLabel('Summon Gamers')
                        .setStyle(ButtonStyle.Success),
                );

            await enlistPrompt.edit({components: [summonButton]});

            const summonCollector: InteractionCollector<ButtonInteraction> = interaction.channel.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: (1.08e+7), // 3 hour (1.08e+7 ms) timer
                max: 1,
                filter: i => i.customId === summonButton.components[0].data["custom_id"]
            });

            summonCollector.on('collect', async i => {
                let content: string;

                if (enlistUserData.enlistedUserIds.length == 1 && enlistUserData.potentialUserIds.length >= 1) {
                    content = `lol ${enlistedUsers.join(',')} has no friends (except maybe ${potentialUsers.join(',')})`;
                } else if (enlistUserData.enlistedUserIds.length == 1) {
                    content = `lol ${enlistedUsers.join(',')} has no friends`;
                } else if (enlistUserData.enlistedUserIds.length + enlistUserData.potentialUserIds.length >= minGamers) {
                    content = `${enlistedUsers.join(',')} : You have ${minGamers} gamers if ${potentialUsers.join(',')} play`;
                } else if (enlistUserData.enlistedUserIds.length == minGamers) {
                    content = `${enlistedUsers.join(',')} (and maybe ${potentialUsers.join(',')}) : Gamer Time is upon us`;
                } else {
                    content = `${enlistedUsers.join(',')} : Insufficient Gamers`;
                }

                await i.channel.send({content});

            })
            summonCollector.on('end', async () => {
                await enlistPrompt.edit({components: []})
            })
        });
    }
}
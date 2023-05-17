import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Collection,
    CommandInteraction,
    CommandInteractionOptionResolver,
    ComponentType,
    EmbedBuilder,
    InteractionCollector,
    Message,
    SlashCommandBuilder,
    Snowflake,
    userMention
} from "discord.js";
import {embedColor, EnlistUserData, IGuild, NewClient, UserInfo} from "../../dependencies/myTypes";
import {updateEnlistUserEmbed} from "../../dependencies/helpers/updateEnlistUserEmbed";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/terminationListener";
import {updateUserData} from "../../dependencies/helpers/updateUserData";
import guilds from "../../dependencies/schemas/guild-schema";
import {getLevelFromXp} from "../../dependencies/helpers/getLevelFromXp";
import log from "../../dependencies/logger";

// TODO add edit button to edit fields
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

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        await interaction.reply({content: 'prompt sent', ephemeral: true})
        const userData = guildData.userData

        // retrieve parameters
        const options = interaction.options as CommandInteractionOptionResolver // ts thinks the .get options dont exist
        const game = options.getString('game')
        const minGamers = options.getInteger('minimum')
        const title = options.getString('title') ?? 'Gamer Time'
        const roleId = options.getRole('role') ?? undefined

        let role: any = ''
        if (roleId) {
            role = roleId;
        } else {
            const selectedRoleId = guildData.serverData.roles.autoenlist;
            const selectedRole = interaction.guild.roles.cache.get(selectedRoleId);
            if (selectedRole) {
                role = `<@&${selectedRole.id}>`;
            }
        }

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`✓`)
                    .setCustomId('Gamer')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setLabel(`✘`)
                    .setCustomId('Cringe')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setLabel(`❔`)
                    .setCustomId('Perhaps')
                    .setStyle(ButtonStyle.Primary),
            );

        const embed = new EmbedBuilder()
            .setTitle(`${title}`)
            .setDescription(`need ${minGamers} for ${game}`)
            .addFields(
                {name: 'Gaming', value: '-', inline: true},
                {name: 'Not Gaming', value: '-', inline: true},
                {name: 'Perhaps', value: '-', inline: true},
            )
            .setColor(embedColor)
            .setFooter({text: 'Selecting the "Perhaps" option will not count towards your enlist stats',})

        // Not an interaction reply bc interactions are only editable for 15 min
        let enlistPrompt: Message = await interaction.channel.send({
            content: `${role}`,
            embeds: [embed],
            components: [row]
        });

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
        let pendingResponse = []

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
            const notDuplicateUser = !(enlistUserData.potentialUserIds.includes(i.user.id))
            const notPendingResponse = !(pendingResponse.includes(i.user.id))

            if (isPerhapsButton && notDuplicateUser && notPendingResponse) {
                // Send a time menu for the user to select their availability
                pendingResponse.push(i.user.id)
                await i.reply({
                    content: 'please select your availability',
                    components: [require('../../dependencies/timeDropdownMenu').timeMenu],
                    ephemeral: true
                });

                const timeCollector = interaction.channel.createMessageComponentCollector({
                    componentType: ComponentType.SelectMenu,
                    time: 45000,
                    max: 1,
                    filter: (i) => i.customId === 'time' && i.user.id === interaction.member.user.id,
                });

                timeCollector.on('end', async collected => {
                    if (collected.size !== 0) {
                        const userResponse = collected.first()
                        const guildMember = userResponse.user.username
                        const index = enlistUserData.potentialUsers.findIndex(user => user == `> ${guildMember}\n`)

                        if (userResponse?.values[0] == undefined) { // idk why this would happen, but just in case
                            enlistUserData.userAvailabilityMap.set(userResponse?.user.id, 'Not Sure')
                            enlistUserData.potentialUsers[index] = `> ${guildMember} ~'Not Sure'\n`
                        } else {
                            enlistUserData.userAvailabilityMap.set(userResponse.user.id, userResponse?.values[0])
                            enlistUserData.potentialUsers[index] = `> ${guildMember} ~${userResponse.values[0]}\n`
                        }
                        await updateEnlistUserEmbed(i, embed, enlistUserData, enlistPrompt, row, role)
                    }

                    pendingResponse.splice(pendingResponse.indexOf(i.user.id), 1)
                    await i.deleteReply()
                });
            } else if (isPerhapsButton) { // prevents embed from updating if user tries to spam perhaps button
                i.deferUpdate(); // do nothing (ignore the input)
            } else {
                // Defer the interaction update to prevent the "this interaction failed" message
                const deferUpdate = i.deferUpdate();
                const updateEmbed = updateEnlistUserEmbed(i, embed, enlistUserData, enlistPrompt, row, role)

                await Promise.all([deferUpdate, updateEmbed])
            }
        });

        enlistCollector.on('end', async collected => {
            removeTerminationListener(terminateBound)
            const noInteractions = !enlistUserData.enlistedUserIds.length && !enlistUserData.rejectedUserIds.length && !enlistUserData.potentialUserIds.length
            if (collected.size === 0 || noInteractions) {
                await enlistPrompt.edit({content: '⚠ ***ENLISTING ENDED*** ⚠', components: []});
                return
            }
            // logic to get users who ignored the enlist prompt for ignore% stat
            const allUserIds = userData.map(user => user.id).flat();
            const allEnlistPromptUserIds = [...enlistUserData.enlistedUserIds, ...enlistUserData.rejectedUserIds, ...enlistUserData.potentialUserIds];
            enlistUserData.ignoredUserIds = allUserIds.filter(id => !allEnlistPromptUserIds.includes(id));

            const enlistUsersWhoGainedXP = [...enlistUserData.enlistedUserIds, ...enlistUserData.rejectedUserIds]

            let userXPMap = new Collection<Snowflake, number>()
            for (const userId of enlistUsersWhoGainedXP) {
                let user = userData.find(user => user.id === userId)
                let oldXPValue = user ? user.enlistStats.enlistXP : 0
                userXPMap.set(userId, oldXPValue)
            }

            // update user data and push to mongo
            const updateEnlistedUserData = updateUserData(interaction, enlistUserData.enlistedUserIds, UserInfo.Enlist);
            const updateRejectedUserData = updateUserData(interaction, enlistUserData.rejectedUserIds, UserInfo.Reject);
            const updateIgnoredUserData = updateUserData(interaction, enlistUserData.ignoredUserIds, UserInfo.Ignore);
            const updatePrompt = enlistPrompt.edit({content: '⚠ ***ENLISTING ENDED*** ⚠', components: []});

            await Promise.all([updateEnlistedUserData, updateRejectedUserData, updateIgnoredUserData, updatePrompt])

            let updatedRecently = guildData.updatedAt > Date.now() - (10 * 60 * 60 * 1000); // true if updated in the last 10 seconds
            while (!updatedRecently) {
                updatedRecently = guildData.updatedAt > Date.now() - (10 * 60 * 60 * 1000);
                log.info('Waiting for database update...')
            }
            log.info('Done')

            // fetch new user data for xp value comparison
            const updatedGuildData: IGuild = await guilds.findOne({guildId: interaction.guildId})
            const updatedUserData = updatedGuildData.userData

            // user arrays for level embed
            let usersWhoLeveledUp: string[] = []
            let userLevelChange: string[] = []
            let createLevelEmbed = false

            for (const userId of enlistUsersWhoGainedXP) {
                let newXPValue = updatedUserData.find(user => user.id === userId).enlistStats.enlistXP
                let oldXPValue = userXPMap.get(userId)

                let {level: oldLevel} = getLevelFromXp(oldXPValue)
                let {level: newLevel} = getLevelFromXp(newXPValue)

                if (oldXPValue < newXPValue && oldLevel != newLevel) {
                    createLevelEmbed = true
                    usersWhoLeveledUp.push(userMention(userId))
                    userLevelChange.push(`${getLevelFromXp(oldXPValue).prestige}:${oldLevel} → ${getLevelFromXp(newXPValue).prestige}:${newLevel}`)
                }
            }

            if (createLevelEmbed) {
                let levelEmbed = new EmbedBuilder()
                    .setTitle('Level Summary')
                    .setDescription('Below are all users who leveled up from the most recent enlist')
                    .addFields(
                        {name: 'Users', value: usersWhoLeveledUp.join('\n'), inline: true},
                        {name: 'Level Change', value: userLevelChange.join('\n'), inline: true}
                    )
                    .setColor(embedColor)
                    .setFooter({text: `Use /enlist-stats to see your current level`})

                interaction.channel.send({embeds: [levelEmbed]})
            }

            // summon gamers button
            if (enlistUserData.enlistedUserIds.length == 0) return

            const formatUserMentions = (userIds: string[]): string[] => {
                return userIds.map(id => userMention(id));
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
                time: (3.6e+6), // 1 hour (3.6e+6 ms) 
                max: 1,
                filter: i => i.customId === summonButton.components[0].data["custom_id"]
            });

            summonCollector.on('collect', async i => {
                let content: string;

                if (enlistUserData.enlistedUserIds.length == 1) {
                    content = `${enlistedUsers.join(',')} has no friends, everyone point and laugh)`;
                } else if (enlistUserData.enlistedUserIds.length + enlistUserData.potentialUserIds.length >= minGamers) {
                    content = `${enlistedUsers.join(',')} : You have ${minGamers} gamers if ${potentialUsers.join(',')} play`;
                } else if (enlistUserData.enlistedUserIds.length == minGamers) {
                    content = `${enlistedUsers.join(',')} : Gamer Time is upon us`;
                } else {
                    content = `${enlistedUsers.join(',')} : Insufficient Gamers`;
                }

                await i.channel.send({content});
            });
            summonCollector.on('end', async () => {
                await enlistPrompt.edit({components: []})
            });
        });
    }
}
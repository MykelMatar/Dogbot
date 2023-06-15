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
    GuildMember,
    InteractionCollector,
    Message,
    roleMention,
    SlashCommandBuilder,
    Snowflake,
    userMention
} from "discord.js";
import guilds from "../../dependencies/schemas/guild-schema";
import {embedColor, FetchUserData, IGuild, NewClient, UserInfo} from "../../dependencies/myTypes";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/terminationListener";
import {updateFetchEmbed} from "../../dependencies/helpers/updateFetchEmbed";
import {updateUserData} from "../../dependencies/helpers/updateUserData";
import log from "../../dependencies/constants/logger";
import {getLevelFromXp} from "../../dependencies/helpers/getLevelFromXp";
import {multiplayerGameTitles} from "../../dependencies/constants/gameTitles";
import {waitForUpdate} from "../../dependencies/helpers/waitForUpdate";
import {embedLimits} from "../../dependencies/constants/embedLimits";

export const fetchGamers = {
    data: new SlashCommandBuilder()
        .setName('fetch-gamers')
        .setDescription('creates prompt that allows users to RSVP for gamer time')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('game to be played')
                .setRequired(true)
                .setMaxLength(embedLimits.description)
                .setAutocomplete(true))
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
                .setMaxLength(embedLimits.title)
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to @ when sending this prompt. Can be set automatically via the /fetch-set-role')
                .setRequired(false)
        ),

    async autocomplete(interaction) {
        const options = interaction.options as CommandInteractionOptionResolver
        const focusedValue = options.getFocused()?.toLowerCase();
        const focusedLetter = focusedValue.charAt(0)
        const index = (focusedLetter != '' && isNaN(Number(focusedLetter))) ? focusedLetter.toUpperCase() : 'Top25'
        const filtered = multiplayerGameTitles[index].filter(choice => choice.toLowerCase().startsWith(focusedValue));

        await interaction.respond(
            filtered.map(choice => ({name: choice, value: choice})),
        );
    },

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        const userData = guildData.userData

        // retrieve options
        const options = interaction.options as CommandInteractionOptionResolver // ts thinks the .get options dont exist
        const game = options.getString('game')
        const minGamers = options.getInteger('minimum')
        const title = options.getString('title') ?? 'Gamer Time'
        const roleValue = options.getRole('role')

        let role: any = 'Gamer Time'
        let roleId
        if (roleValue) {
            role = roleMention(roleValue.id);
        } else if (guildData?.settings?.fetchRole) {
            role = guildData?.settings?.fetchRole;
            const regex = /<@&(\d+)>/;
            const match = role.match(regex);
            roleId = match && match[1];
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
            .setFooter({text: 'Selecting the "Perhaps" option will not count towards your fetch stats',})

        let {ip, port} = guildData.mcServerData.selectedServer
        if (['minecraft', 'mc'].includes(game.toLowerCase().replace(/\s/g, ""))) {
            embed.setDescription(`need ${minGamers} for ${game} ☛ __**${ip}:${port}**__`)
        }

        // Not an interaction reply bc interactions are only editable for 15 min
        let enlistPrompt: Message = await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        if (role != 'Gamer Time') {
            await interaction.reply({content: role, allowedMentions: {roles: [roleId]}})
        } else {
            await interaction.reply({content: role})
        }

        let enlistUserData: FetchUserData = {
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
        const pendingResponse = []

        const enlistCollector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 1.08e+7, // 3 hour (1.08e+7) timer
            filter: (i) => {
                if (i.message.id != enlistPrompt.id) return false // prevent simultaneous prompts from affecting each other
                return [gamingButtonId, perhapsButtonId, rejectButtonId].includes(i.customId);
            },
        });
        const terminateBound = terminate.bind(null, client, enlistCollector)
        await terminationListener(client, enlistCollector, terminateBound)

        enlistCollector.on('collect', async buttonInteraction => {
            const isPerhapsButton = buttonInteraction.customId === perhapsButtonId;
            const notDuplicateUser = !(enlistUserData.potentialUserIds.includes(buttonInteraction.user.id))
            const notPendingResponse = !(pendingResponse.includes(buttonInteraction.user.id))

            if (isPerhapsButton && notDuplicateUser && notPendingResponse) {
                // Send a time menu for the user to select their availability
                pendingResponse.push(buttonInteraction.user.id)
                await buttonInteraction.reply({
                    content: 'please select your availability',
                    components: [require('../../dependencies/constants/timeDropdownMenu').default],
                    ephemeral: true
                });

                const timeCollector = interaction.channel.createMessageComponentCollector({
                    componentType: ComponentType.SelectMenu,
                    time: 60000,
                    max: 1,
                    filter: (i) =>
                        i.customId === 'time' &&
                        i.user.id === buttonInteraction.member.user.id,
                });

                timeCollector.on('collect', async timeInteraction => {
                    const member = timeInteraction.member as GuildMember;
                    const username = member.displayName

                    if (!timeInteraction.values[0]) { // idk why this would happen, but just in case
                        enlistUserData.userAvailabilityMap.set(timeInteraction.user.id, 'Not Sure')
                        enlistUserData.potentialUsers.push(`> ${username} ~'Not Sure'\n`)
                        enlistUserData.potentialUserIds.push(timeInteraction.user.id)
                    } else {
                        enlistUserData.userAvailabilityMap.set(timeInteraction.user.id, timeInteraction.values[0])
                        enlistUserData.potentialUsers.push(`> ${username} ~${timeInteraction.values[0]}\n`)
                        enlistUserData.potentialUserIds.push(timeInteraction.user.id)
                    }
                    await updateFetchEmbed(buttonInteraction, embed, enlistUserData, enlistPrompt)

                    pendingResponse.splice(pendingResponse.indexOf(buttonInteraction.user.id), 1)
                    await buttonInteraction.deleteReply()
                });
            } else if (isPerhapsButton) { // prevents embed from updating if user tries to spam perhaps button
                buttonInteraction.deferUpdate();
            } else {
                const deferUpdate = buttonInteraction.deferUpdate();
                const updateEmbed = updateFetchEmbed(buttonInteraction, embed, enlistUserData, enlistPrompt)

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
            // logic to get users who ignored the fetch prompt for ignore% stat
            const allUserIds = userData.map(user => user.id).flat();
            const allEnlistPromptUserIds = [...enlistUserData.enlistedUserIds, ...enlistUserData.rejectedUserIds, ...enlistUserData.potentialUserIds];
            enlistUserData.ignoredUserIds = allUserIds.filter(id => !allEnlistPromptUserIds.includes(id));

            const enlistUsersWhoGainedXP = [...enlistUserData.enlistedUserIds, ...enlistUserData.rejectedUserIds]

            let userXPMap = new Collection<Snowflake, number>()
            for (const userId of enlistUsersWhoGainedXP) {
                let user = userData.find(user => user.id === userId)
                let oldXPValue = user ? user.fetchStats.fetchXP : 0
                userXPMap.set(userId, oldXPValue)
            }

            // update user data and push to mongo
            const updateEnlistedUserData = updateUserData(interaction, enlistUserData.enlistedUserIds, UserInfo.Enlist);
            const updateRejectedUserData = updateUserData(interaction, enlistUserData.rejectedUserIds, UserInfo.Reject);
            const updateIgnoredUserData = updateUserData(interaction, enlistUserData.ignoredUserIds, UserInfo.Ignore);
            const updatePrompt = enlistPrompt.edit({content: '⚠ ***ENLISTING ENDED*** ⚠', components: []});

            await Promise.all([updateEnlistedUserData, updateRejectedUserData, updateIgnoredUserData, updatePrompt])

            await waitForUpdate(guildData)
            log.info('Done')

            // fetch new user data for xp value comparison
            guildData = await guilds.findOne({guildId: interaction.guildId})
            const updatedUserData = guildData.userData

            // user arrays for level embed
            let usersWhoLeveledUp: string[] = []
            let userLevelChange: string[] = []
            let createLevelEmbed = false

            for (const userId of enlistUsersWhoGainedXP) {
                let newXPValue = updatedUserData.find(user => user.id === userId).fetchStats.fetchXP
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
                    .setDescription('Below are all users who leveled up from the most recent fetch')
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
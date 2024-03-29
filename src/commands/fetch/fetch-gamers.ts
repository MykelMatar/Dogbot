import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Collection,
    CommandInteraction,
    CommandInteractionOptionResolver,
    ComponentType,
    EmbedBuilder,
    Message,
    roleMention,
    SlashCommandBuilder,
    Snowflake,
    TextInputStyle,
    userMention
} from "discord.js";
import guilds from "../../dependencies/schemas/guild-schema";
import {CustomClient, embedColor, FetchUserData, MongoGuild, SlashCommand, UserInfo} from "../../dependencies/myTypes";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/otherHelpers/terminationListener";
import updateFetchEmbed from "../../dependencies/helpers/fetchHelpers/updateFetchEmbed";
import updateUserData from "../../dependencies/helpers/otherHelpers/updateUserData";
import log from "../../dependencies/constants/logger";
import getLevelFromXp from "../../dependencies/helpers/fetchHelpers/getLevelFromXp";
import waitForUpdate from "../../dependencies/helpers/otherHelpers/waitForUpdate";
import embedLimits from "../../dependencies/constants/embedLimits";
import {multiplayerGameTitles} from "../../dependencies/constants/multiplayerGameTitles";
import autocompleteTimes from "../../dependencies/constants/autocompleteTimes";
import collectTime from "../../dependencies/helpers/fetchHelpers/collectTime";
import collectEmbedChanges from "../../dependencies/helpers/fetchHelpers/collectEmbedChanges";
import {abbreviations} from "../../dependencies/constants/timeZones";
import summonGamers from "../../dependencies/helpers/fetchHelpers/summonGamers";
import calculateFetchTimer from "../../dependencies/helpers/fetchHelpers/calculateFetchTimer";
import messageStillExists from "../../dependencies/helpers/otherHelpers/messageStillExists";


export const fetchGamers: SlashCommand = {
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
            option.setName('time')
                .setDescription('time (in hh:mm am/pm or 24hr format)')
                .setMaxLength(40)
                .setAutocomplete(true)
                .setRequired(false))
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
        const focusedValue = options.getFocused(true)

        if (focusedValue.name == 'game') {
            const focusedLetter = focusedValue.value.toLowerCase().charAt(0)
            const index = (focusedLetter != '' && isNaN(Number(focusedLetter))) ? focusedLetter.toUpperCase() : 'Top25'
            const filtered = multiplayerGameTitles[index].filter(choice => choice.toLowerCase().startsWith(focusedValue.value));

            await interaction.respond(
                filtered.map(choice => ({name: choice, value: choice})),
            );
        } else if (focusedValue.name == 'time') {
            const focusedLetter = focusedValue.value.toLowerCase().charAt(0)
            const index = (focusedLetter != '' && !isNaN(Number(focusedLetter))) ? focusedLetter.toUpperCase() : 'default'
            const filtered = autocompleteTimes[index].filter(choice => choice.toLowerCase().startsWith(focusedValue.value));

            await interaction.respond(
                filtered.map(choice => ({name: choice, value: choice})),
            );
        }
    },

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {
        const userData = guildData.userData

        // retrieve options
        const options = interaction.options as CommandInteractionOptionResolver // ts thinks the .get options dont exist
        const game = options.getString('game', true)
        const minGamers = options.getInteger('minimum', true)
        const title = options.getString('title') ?? 'Gamer Time'
        const roleValue = options.getRole('role')
        const timeValue = options.getString('time') ?? 'any time'
        const time = timeValue.toLowerCase() == 'any' ? 'any time' : timeValue;
        let role: any = 'Gamer Time'
        let roleId

        if (time !== 'any time') {
            const timeZone = guildData.settings.timeZone
            if (timeZone.offset == undefined) {
                await client.commands.get('set-timezone').execute(client, interaction, guildData)
                await waitForUpdate(guildData)
            }
        }

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
                    .setCustomId('gamer')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setLabel(`✘`)
                    .setCustomId('cringe')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setLabel(`❔`)
                    .setCustomId('perhaps')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel(`⚙️`)
                    .setCustomId('settings')
                    .setStyle(ButtonStyle.Secondary),
            );

        const timeZoneAbbr = abbreviations[guildData.settings.timeZone.name]

        const embed = new EmbedBuilder()
            .setTitle(`${title}`)
            .setDescription(`need ${minGamers} for ${game}\n*Set for ${time} ${timeZoneAbbr}*`)
            .addFields(
                {name: 'Gaming', value: '-', inline: true},
                {name: 'Not Gaming', value: '-', inline: true},
                {name: 'Perhaps', value: '-', inline: true},
            )
            .setColor(embedColor)
            .setFooter({text: `Interact with this prompt to get XP and Prediction Points`})

        let {ip, port} = guildData.mcServerData.selectedServer
        if (['minecraft', 'mc'].includes(game.toLowerCase().replace(/\s/g, "")) && ip) {
            embed.setDescription(`need ${minGamers} for ${game} ☛ __**${ip}:${port}**__`)
        }

        if (role != 'Gamer Time') {
            // if timezone is selected interaction will already have been replied to
            await interaction[interaction.replied ? 'editReply' : 'reply']({
                content: role,
                allowedMentions: {roles: [roleId]}
            })
        } else {
            await interaction[interaction.replied ? 'editReply' : 'reply']({
                content: role
            })
        }

        // Not an interaction reply bc interactions are only editable for 15 min
        const fetchPrompt: Message = await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        const fetchUserData: FetchUserData = {
            acceptedUsers: ['-'],
            acceptedUserIds: [],
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
        const editButtonId = row.components[3].data["custom_id"]
        const customIds = [gamingButtonId, rejectButtonId, perhapsButtonId, editButtonId]
        const pendingResponse = []

        // calculate time until gamer time
        const timer = calculateFetchTimer(client, time, guildData)

        const fetchCollector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: timer,
            filter: (i) => {
                if (i.message.id != fetchPrompt.id) return false // prevent simultaneous prompts from affecting each other
                return customIds.includes(i.customId);
            },
        });
        const terminateBound = terminate.bind(null, client, fetchCollector)
        terminationListener(client, fetchCollector, terminateBound)

        fetchCollector.on('collect', async buttonInteraction => {
            if (!(await messageStillExists(fetchPrompt, terminateBound))) return
            const isPerhapsButton = buttonInteraction.customId === perhapsButtonId;
            const notDuplicateUser = !(fetchUserData.potentialUserIds.includes(buttonInteraction.user.id))
            const notPendingResponse = !(pendingResponse.includes(buttonInteraction.user.id))

            if (isPerhapsButton && notDuplicateUser && notPendingResponse) {
                // Send a time menu for the user to select their availability
                pendingResponse.push(buttonInteraction.user.id)
                await buttonInteraction.reply({
                    content: 'please select your availability',
                    components: [require('../../dependencies/constants/timeDropdownMenu').default],
                    ephemeral: true
                });

                await collectTime(interaction, buttonInteraction, fetchUserData, embed, fetchPrompt, customIds, pendingResponse);
            } else if (isPerhapsButton) { // prevents embed from updating if user tries to spam perhaps button
                buttonInteraction.deferUpdate();
            } else if (buttonInteraction.customId === 'settings') {
                await collectEmbedChanges(buttonInteraction, embed, fetchPrompt)
            } else {
                const deferUpdate = buttonInteraction.deferUpdate();
                const updateEmbed = updateFetchEmbed(buttonInteraction, embed, fetchUserData, fetchPrompt, customIds)

                await Promise.all([deferUpdate, updateEmbed])
            }
        });

        fetchCollector.on('end', async collected => {
            removeTerminationListener(terminateBound)
            if (!(await messageStillExists(fetchPrompt))) return

            const noInteractions = !fetchUserData.acceptedUserIds.length && !fetchUserData.rejectedUserIds.length && !fetchUserData.potentialUserIds.length
            if (collected.size === 0 || noInteractions) {
                await fetchPrompt.edit({content: '⚠ ***FETCH ENDED*** ⚠', components: []});
                return
            }

            // logic to get users who ignored the fetch prompt for ignore stat
            const allUserIds = userData.map(user => user.id).flat();
            const allEnlistPromptUserIds = [...fetchUserData.acceptedUserIds, ...fetchUserData.rejectedUserIds, ...fetchUserData.potentialUserIds];
            fetchUserData.ignoredUserIds = allUserIds.filter(id => !allEnlistPromptUserIds.includes(id));

            // get all users who gained xp
            const usersWhoGainedXP = [...fetchUserData.acceptedUserIds, ...fetchUserData.rejectedUserIds]

            let userXPMap = new Collection<Snowflake, number>()
            for (const userId of usersWhoGainedXP) {
                let user = userData.find(user => user.id === userId)
                let oldXPValue = user ? user.fetchStats.fetchXP : 0
                userXPMap.set(userId, oldXPValue)
            }

            // update user data and push to mongo
            const updateEnlistedUserData = updateUserData(interaction, fetchUserData.acceptedUserIds, UserInfo.Accept);
            const updateRejectedUserData = updateUserData(interaction, fetchUserData.rejectedUserIds, UserInfo.Reject);
            const updateIgnoredUserData = updateUserData(interaction, fetchUserData.ignoredUserIds, UserInfo.Ignore);
            const updatePrompt = fetchPrompt.edit({content: '⚠ ***ENLISTING ENDED*** ⚠', components: []});

            await Promise.all([updateEnlistedUserData, updateRejectedUserData, updateIgnoredUserData, updatePrompt])

            await waitForUpdate(guildData)
            log.info('Done')

            // fetch new user data for xp value comparison
            guildData = await guilds.findOne({guildId: interaction.guildId})
            const updatedUserData = guildData.userData

            // user arrays for level embed
            const usersWhoLeveledUp: string[] = []
            const userLevelChange: string[] = []
            let createLevelEmbed = false

            for (const userId of usersWhoGainedXP) {
                const newXPValue = updatedUserData.find(user => user.id === userId).fetchStats.fetchXP
                const oldXPValue = userXPMap.get(userId)

                const {level: oldLevel} = getLevelFromXp(oldXPValue)
                const {level: newLevel} = getLevelFromXp(newXPValue)

                if (oldXPValue < newXPValue && oldLevel != newLevel) {
                    createLevelEmbed = true
                    usersWhoLeveledUp.push(userMention(userId))
                    userLevelChange.push(`${getLevelFromXp(oldXPValue).prestige}:${oldLevel} → ${getLevelFromXp(newXPValue).prestige}:${newLevel}`)
                }
            }

            if (!(await messageStillExists(fetchPrompt))) return
            if (createLevelEmbed) {
                const levelEmbed = new EmbedBuilder()
                    .setTitle('Level Summary')
                    .setDescription('Below are all users who leveled up from the most recent fetch')
                    .addFields(
                        {name: 'Users', value: usersWhoLeveledUp.join('\n'), inline: true},
                        {name: 'Level Change', value: userLevelChange.join('\n'), inline: true}
                    )
                    .setColor(embedColor)
                    .setFooter({text: `Use /fetch-stats to see your current level`})
                interaction.channel.send({embeds: [levelEmbed]})
            }

            await summonGamers(interaction, fetchUserData, minGamers)

            // TODO add role call? send a button or something so users can ready up and join the call
        });
    }
}
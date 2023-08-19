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
import {updateFetchEmbed} from "../../dependencies/helpers/fetchHelpers/updateFetchEmbed";
import {updateUserData} from "../../dependencies/helpers/otherHelpers/updateUserData";
import log from "../../dependencies/constants/logger";
import {getLevelFromXp} from "../../dependencies/helpers/fetchHelpers/getLevelFromXp";
import {waitForUpdate} from "../../dependencies/helpers/otherHelpers/waitForUpdate";
import {embedLimits} from "../../dependencies/constants/embedLimits";
import {multiplayerGameTitles} from "../../dependencies/constants/multiplayerGameTitles";
import {autocompleteTimes} from "../../dependencies/constants/autocompleteTimes";
import {collectTime} from "../../dependencies/helpers/fetchHelpers/collectTime";
import {collectEmbedChanges} from "../../dependencies/helpers/fetchHelpers/collectEmbedChanges";


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
                .setDescription('time (in "00:00 am" format). Type "any" for no time.')
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
        let time = options.getString('time') ?? 'any time'
        time = time.toLowerCase() == 'any' ? 'any time' : time;
        const title = options.getString('title') ?? 'Gamer Time'
        const roleValue = options.getRole('role')

        // if (time !== 'any time') {
        //     // check if user has time zone set. if not, ask them to input it.
        //     const timeZone = guildData.settings.timeZone
        //     console.log(timeZone)
        //     if (!timeZone) {
        //         await client.commands.get('set-timezone').execute(client, interaction, guildData)
        //     }
        // }

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

        const embed = new EmbedBuilder()
            .setTitle(`${title}`)
            .setDescription(`need ${minGamers} for ${game}\n*Set for ${time}*`)
            .addFields(
                {name: 'Gaming', value: '-', inline: true},
                {name: 'Not Gaming', value: '-', inline: true},
                {name: 'Perhaps', value: '-', inline: true},
            )
            .setColor(embedColor)
            .setFooter({text: `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`})
        // .setFooter({text: 'Selecting the "Perhaps" option will not count towards your fetch stats',})

        let {ip, port} = guildData.mcServerData.selectedServer
        if (['minecraft', 'mc'].includes(game.toLowerCase().replace(/\s/g, ""))) {
            embed.setDescription(`need ${minGamers} for ${game} ☛ __**${ip}:${port}**__`)
        }

        if (role != 'Gamer Time') {
            await interaction.reply({content: role, allowedMentions: {roles: [roleId]}})
        } else {
            await interaction.reply({content: role})
        }

        // Not an interaction reply bc interactions are only editable for 15 min
        const enlistPrompt: Message = await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        const fetchUserData: FetchUserData = {
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
        const editButtonId = row.components[3].data["custom_id"]
        const customIds = [gamingButtonId, rejectButtonId, perhapsButtonId, editButtonId]
        const pendingResponse = []

        // TODO add timezone stuff

        // calculate time until gamer time
        // const getDateTime = (timeString: string): DateTime | undefined => {
        //     const normalizedTimeString = timeString.replace(/\s+(am|pm)$/i, '$1');
        //     const formats = ['h:mma', 'ha']; // Add more formats as needed
        //
        //     for (const format of formats) {
        //         const parsedTime = DateTime.fromFormat(normalizedTimeString, format);
        //         if (parsedTime.isValid) {
        //             return parsedTime;
        //         }
        //     }
        //     return undefined;
        // };

        // end nov 5 this year 
        // starts march 10 next year

        // const local = DateTime.local()
        // const rezoned = local.setZone(offset)
        // console.log(rezoned)

        // let validTime = getDateTime(time)
        // if (validTime) {
        //     console.log(interaction.createdTimestamp)
        //     console.log(validTime.toMillis())
        //     const now = DateTime.local();
        //     const currentTime = interaction.createdTimestamp // should get users local time? not sure
        //
        //     // If the future time is earlier than the current time, add one day to the future time
        //     if (validTime <= now) {
        //         validTime = validTime.plus({days: 1});
        //     }
        //
        //     const diff = validTime.diff(now, ['hours', 'minutes']);
        //     console.log(diff.milliseconds, diff.minutes)

        // let timeLeft
        // const currentTime = DateTime.now()
        // console.log(currentTime.hour, validTime.hour)

        // console.log(timeLeft.toFormat("h 'hours' m 'minutes'"))
        // }

        const enlistCollector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 1.08e+7, // 3 hour (1.08e+7) timer
            filter: (i) => {
                if (i.message.id != enlistPrompt.id) return false // prevent simultaneous prompts from affecting each other
                return customIds.includes(i.customId);
            },
        });
        const terminateBound = terminate.bind(null, client, enlistCollector)
        await terminationListener(client, enlistCollector, terminateBound)

        enlistCollector.on('collect', async buttonInteraction => {
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

                await collectTime(interaction, buttonInteraction, fetchUserData, embed, enlistPrompt, customIds, pendingResponse);
            } else if (isPerhapsButton) { // prevents embed from updating if user tries to spam perhaps button
                buttonInteraction.deferUpdate();
            } else if (buttonInteraction.customId === 'settings') {
                await collectEmbedChanges(buttonInteraction, embed, enlistPrompt)
            } else {
                const deferUpdate = buttonInteraction.deferUpdate();
                const updateEmbed = updateFetchEmbed(buttonInteraction, embed, fetchUserData, enlistPrompt, customIds)

                await Promise.all([deferUpdate, updateEmbed])
            }
        });


        enlistCollector.on('end', async collected => {
            removeTerminationListener(terminateBound)
            const noInteractions = !fetchUserData.enlistedUserIds.length && !fetchUserData.rejectedUserIds.length && !fetchUserData.potentialUserIds.length
            if (collected.size === 0 || noInteractions) {
                await enlistPrompt.edit({content: '⚠ ***ENLISTING ENDED*** ⚠', components: []});
                return
            }
            // logic to get users who ignored the fetch prompt for ignore% stat
            const allUserIds = userData.map(user => user.id).flat();
            const allEnlistPromptUserIds = [...fetchUserData.enlistedUserIds, ...fetchUserData.rejectedUserIds, ...fetchUserData.potentialUserIds];
            fetchUserData.ignoredUserIds = allUserIds.filter(id => !allEnlistPromptUserIds.includes(id));

            const enlistUsersWhoGainedXP = [...fetchUserData.enlistedUserIds, ...fetchUserData.rejectedUserIds]

            let userXPMap = new Collection<Snowflake, number>()
            for (const userId of enlistUsersWhoGainedXP) {
                let user = userData.find(user => user.id === userId)
                let oldXPValue = user ? user.fetchStats.fetchXP : 0
                userXPMap.set(userId, oldXPValue)
            }

            // update user data and push to mongo
            const updateEnlistedUserData = updateUserData(interaction, fetchUserData.enlistedUserIds, UserInfo.Enlist);
            const updateRejectedUserData = updateUserData(interaction, fetchUserData.rejectedUserIds, UserInfo.Reject);
            const updateIgnoredUserData = updateUserData(interaction, fetchUserData.ignoredUserIds, UserInfo.Ignore);
            const updatePrompt = enlistPrompt.edit({content: '⚠ ***ENLISTING ENDED*** ⚠', components: []});

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

            for (const userId of enlistUsersWhoGainedXP) {
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

            if (createLevelEmbed) {
                const levelEmbed = new EmbedBuilder()
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
            if (fetchUserData.enlistedUserIds.length == 0) return

            const formatUserMentions = (userIds: string[]): string[] => {
                return userIds.map(id => userMention(id));
            };

            const enlistedUsers = formatUserMentions(fetchUserData.enlistedUserIds);
            const potentialUsers = formatUserMentions(fetchUserData.potentialUserIds);

            const summonButton = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('Summon')
                        .setLabel('summonGamers')
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

                if (fetchUserData.enlistedUserIds.length == 1) {
                    content = `${enlistedUsers.join(',')} has no friends, everyone point and laugh)`;
                } else if (fetchUserData.enlistedUserIds.length + fetchUserData.potentialUserIds.length >= minGamers) {
                    content = `${enlistedUsers.join(',')} : You have ${minGamers} gamers if ${potentialUsers.join(',')} play`;
                } else if (fetchUserData.enlistedUserIds.length == minGamers) {
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
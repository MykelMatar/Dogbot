import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    CommandInteractionOptionResolver,
    ComponentType,
    EmbedBuilder,
    GuildMember,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
    Snowflake,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import {
    CustomClient,
    embedColor,
    MongoGuild,
    PredictionStats,
    SlashCommand,
    UserInfo
} from "../../dependencies/myTypes";
import {terminate, terminationListener} from "../../dependencies/helpers/otherHelpers/terminationListener";
import updateUserData from "../../dependencies/helpers/otherHelpers/updateUserData";
import guilds from "../../dependencies/schemas/guild-schema";
import log from "../../dependencies/constants/logger";
import {updateProgressBars} from "../../dependencies/helpers/otherHelpers/updateProgressBars";
import waitForUpdate from "../../dependencies/helpers/otherHelpers/waitForUpdate";
import messageStillExists from "../../dependencies/helpers/otherHelpers/messageStillExists";
import collectPredictionEmbedChanges from "../../dependencies/helpers/otherHelpers/collectPredictionEmbedChanges";

export const prediction: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('prediction')
        .setDescription('Create a prediction and gamble with your prediction points')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('prediction')
                .setDescription('what you want to predict')
                .setRequired(true)),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {
        const commandOptions = interaction.options as CommandInteractionOptionResolver
        const prompt = commandOptions.getString('prediction')

        // initialize embed and button row
        const predictionEmbed = new EmbedBuilder()
            .setTitle(`${prompt}`)
            .setDescription(`Point Pool 💰 0 💰`)
            .addFields(
                {name: `Yes`, value: '[▱▱▱▱▱▱▱▱▱▱] 0%', inline: true},
                {name: `\u200B`, value: '\u200B', inline: true},
                {name: `No`, value: '[▱▱▱▱▱▱▱▱▱▱] 0%', inline: true},
                {name: `Believers ― *1.0x*`, value: '-', inline: true},
                {name: `\u200B`, value: '\u200B', inline: true},
                {name: `Doubters ― *1.0x*`, value: '-', inline: true})
            .setFooter({text: `This prediction will be active for 2 min`})
            .setColor(embedColor)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`Yes`)
                    .setCustomId('predictYes')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setLabel(`No`)
                    .setCustomId('predictNo')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setLabel(`⚙️`)
                    .setCustomId('settings')
                    .setStyle(ButtonStyle.Secondary),
            );

        await interaction.reply({content: '*Prediction Active*'})
        const sent = await interaction.channel.send({embeds: [predictionEmbed], components: [row]})

        // initialize data structures
        const predictors: Map<Snowflake, string> = new Map()
        const betAmountMap = new Map<string, number>()
        const believers: string[] | Snowflake[] = []
        const believerIds: string[] | Snowflake[] = []
        const doubters: string[] | Snowflake[] = []
        const doubterIds: string[] | Snowflake[] = []
        const pendingResponse = []

        let totalPool = 0
        let yesPool = 0
        let noPool = 0

        let numberOfVotes: PredictionStats = {
            choice1: 0, // yes (named this way bc of the updateProgressBars Function)
            choice2: 0, // no
            total: 0
        }

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 120_000,
            filter: (i) => {
                if (i.message.id != sent.id) return false
                return ['predictYes', 'predictNo', 'settings'].includes(i.customId)
            }
        });
        const terminateBound = terminate.bind(null, client, collector)
        terminationListener(client, collector, terminateBound)

        // start collector
        collector.on('collect', async i => {
            if (!(await messageStillExists(sent, terminateBound))) return

            if (i.customId === 'settings') {
                await collectPredictionEmbedChanges(i, predictionEmbed, sent)
                return
            }

            if (pendingResponse.includes(i.user.id)) {
                await i.reply({content: `Please wait 15s before trying again`, ephemeral: true})
                return
            }

            // get user data or create user data if it doesn't exist
            const user = guildData.userData.find(user => user.id === i.user.id);
            if (user == undefined || JSON.stringify(user.predictionStats) === '{}') {
                await updateUserData(interaction, [i.user.id], UserInfo.PredictionCreate)
                await waitForUpdate(guildData)
                guildData = await guilds.findOne({guildId: interaction.guildId})
            }

            const member = i.member as GuildMember;
            const isBeliever = i.customId === 'predictYes';

            const targetArray = isBeliever ? believers : doubters;
            const targetIds = isBeliever ? believerIds : doubterIds;
            const targetFieldIndex = isBeliever ? 3 : 5;

            const progressBarCustomId = isBeliever ? 'choice1' : 'choice2'
            let userPoints = guildData.userData.find(user => user.id === i.user.id)?.predictionStats?.points
            userPoints = userPoints == undefined ? 1000 : userPoints // just in case database issue occurs

            if (believerIds.includes(i.user.id) || doubterIds.includes(i.user.id)) {
                await i.reply({
                    content: `You already made a bet, how did you forget? you're name is right there.`,
                    ephemeral: true
                })
                return
            }
            pendingResponse.push(i.user.id)

            const modal = new ModalBuilder()
                .setTitle('Bet Amount')
                .setCustomId('betModal')

            const amountActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('amountInput')
                    .setLabel(`Enter bet amount. You have ${userPoints} points`)
                    .setRequired(true)
                    .setPlaceholder('type \'All in\' to bet everything')
                    .setMaxLength(20)
                    .setMinLength(1)
                    .setStyle(TextInputStyle.Short)
            );
            modal.addComponents(amountActionRow);

            i.showModal(modal)

            const modalFilter = (modalInteraction) =>
                modalInteraction.customId === 'betModal' &&
                modalInteraction.user.id == i.user.id;

            i.awaitModalSubmit({filter: modalFilter, time: 15_000})
                .then(async (modalInteraction) => {
                    const input = modalInteraction.fields.getTextInputValue('amountInput')
                    const isNumeric = /^\d+$/.test(input);
                    const isAllIn = input.toLowerCase().replace(/\s/g, "") == 'allin'
                    const betAmount = isAllIn ? userPoints : parseInt(input, 10)
                    const betConfirmation = isAllIn ? 'went all in' : `bet ${input} points`
                    const choice = isBeliever ? '**Yes**' : '**No**'

                    // invalid input
                    if (!(isNumeric || isAllIn)) {
                        pendingResponse.splice(pendingResponse.indexOf(i.user.id), 1)

                        return modalInteraction[modalInteraction.replied ? 'editReply' : 'reply']({
                            content: `Input a valid number.`,
                            ephemeral: !modalInteraction.replied
                        });
                    } else if (betAmount > userPoints) {
                        pendingResponse.splice(pendingResponse.indexOf(i.user.id), 1)

                        return modalInteraction[modalInteraction.replied ? 'editReply' : 'reply']({
                            content: `You don't have that many points pal. Try again`,
                            ephemeral: !modalInteraction.replied
                        });
                    }

                    // valid input (send confirmation)
                    await modalInteraction[modalInteraction.replied ? 'editReply' : 'reply']({
                        content: `you ${betConfirmation} on **${choice}**`,
                        ephemeral: !modalInteraction.replied
                    });

                    // add bet to pools and betmap 
                    isBeliever ? yesPool += betAmount : noPool += betAmount;
                    totalPool += betAmount
                    betAmountMap.set(i.user.id, betAmount)

                    // add user to predictor map and increase vote count
                    predictors.set(i.user.id, progressBarCustomId)
                    numberOfVotes[predictors.get(i.user.id)] += 1;
                    numberOfVotes.total++;

                    // update arrays and embed
                    targetArray.push(`> ${member.displayName} » ${betAmount} \n`);
                    targetIds.push(i.user.id);

                    const winMultiplier = isBeliever ? totalPool / yesPool : totalPool / noPool;
                    const userType = isBeliever ? 'Believers' : 'Doubters'
                    predictionEmbed.data.description = `Point Pool 💰 ${totalPool} 💰`
                    predictionEmbed.data.fields[targetFieldIndex].name = `${userType} ― *${winMultiplier.toFixed(1)}x*`
                    predictionEmbed.data.fields[targetFieldIndex].value = targetArray.join('');

                    if (!(await messageStillExists(sent, terminateBound))) return
                    await updateProgressBars(sent, predictionEmbed, numberOfVotes, 2, true)
                    pendingResponse.splice(pendingResponse.indexOf(i.user.id), 1)
                })
                .catch(() => {
                    pendingResponse.splice(pendingResponse.indexOf(i.user.id), 1)
                })
        });

        // ask for winner, distribute funds, and update user data
        collector.on('end', async (collected) => {
            if (!(await messageStillExists(sent, terminateBound))) return
            if (collected.size == 0) return;
            // send interaction to ask who won
            const selectWinnerButton = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel(`Choose Winner`)
                        .setCustomId('predictChooseWinner')
                        .setStyle(ButtonStyle.Success),
                );

            sent.edit({components: [selectWinnerButton]})

            try {
                // send button to be able to set winner
                const winnerSelectionFilter = async (i) => {
                    if (i.message.id != sent.id) return false // prevent simultaneous prompts from affecting each other
                    if (i.user.id != interaction.user.id) {
                        await interaction.channel.send(`Only the person who started the prediction can select the winner`)
                        return false
                    }
                    return ['predictChooseWinner'].includes(i.customId);
                };

                const selectWinnerInteraction = await sent.awaitMessageComponent({
                    filter: winnerSelectionFilter,
                    time: 60 * 60_000 // 3.6e6 = 1 hour (in ms) 
                })

                await selectWinnerInteraction.reply({
                    content: 'Please select a winner (Only the person who created the prediction can choose).',
                    components: [row]
                });

                // ask for winner
                if (!(await messageStillExists(sent, terminateBound))) return
                await sent.edit({components: []})
                const winCollectorFilter = async (i) => {
                    const message = await selectWinnerInteraction.fetchReply()
                    if (i.message.id != message.id || i.user.id != interaction.user.id) return false
                    return ['predictYes', 'predictNo'].includes(i.customId);
                };

                // this code doesnt work on the server??? but works if i run it locally??? idk why
                // const winCollector = await winnerInteraction.awaitMessageComponent({
                //     filter: winCollectorFilter,
                //     time: 120_000
                // })

                const winCollector = interaction.channel.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 120_000,
                    max: 1,
                    filter: winCollectorFilter
                });

                winCollector.on('collect', async winCollectorResponse => {
                    const winner = winCollectorResponse.customId == 'predictYes' ? 'Yes' : 'No'
                    const winString = winner === 'Yes' ? `Belivers Win!` : 'Doubters Win!'

                    // Pari-mutuel betting system math + other constant declarations
                    const winningPool = winner === 'Yes' ? yesPool : noPool
                    const bettingFormula = totalPool / winningPool
                    const winMultiplier = winningPool !== 0 ? bettingFormula : 1;
                    const peepoBus = client.emojis.cache.get("994786993777160263")
                    const what = client.emojis.cache.get("1117689831657578538")
                    const pointChangeMap = new Map<string, number>()

                    let totalWinnings = 0
                    for (const [key, value] of betAmountMap.entries()) {
                        const winnings = (value).toFixed(0)
                        totalWinnings += parseInt(winnings)
                    }

                    await selectWinnerInteraction.editReply({
                        content: `${winString} ${what.toString()}.  ${totalWinnings} points distributed amongst winners.`,
                        components: []
                    });

                    // update user data
                    const updatePredictionResults = async (ids: string[], multiplier: number, userInfoType: UserInfo) => {
                        for (const id of ids) {
                            const betAmount = betAmountMap.get(id) || 0;
                            const pointChange = (betAmount * multiplier).toFixed(0);
                            pointChangeMap.set(id, parseInt(pointChange));
                        }

                        await updateUserData(interaction, ids, userInfoType, null, pointChangeMap);
                    };

                    if (winner === 'Yes') {
                        await updatePredictionResults(believerIds, winMultiplier, UserInfo.CorrectPrediction);
                        await updatePredictionResults(doubterIds, 1, UserInfo.IncorrectPrediction);
                    } else {
                        await updatePredictionResults(believerIds, 1, UserInfo.IncorrectPrediction);
                        await updatePredictionResults(doubterIds, winMultiplier, UserInfo.CorrectPrediction);
                    }
                });

            } catch (e) {
                if (!(await messageStillExists(sent, terminateBound))) return
                sent.edit({components: []})
                log.warn('Response Timeout')
            }
        })
    }
}
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
    SlashCommandBuilder,
    Snowflake,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import {embedColor, IGuild, NewClient, UserInfo} from "../../dependencies/myTypes";
import {terminate, terminationListener} from "../../dependencies/helpers/terminationListener";
import {updateProgressBars} from "../../dependencies/helpers/updateProgressBars";
import {updateUserData} from "../../dependencies/helpers/updateUserData";
import {waitForUpdate} from "../../dependencies/helpers/waitForUpdate";
import guilds from "../../dependencies/schemas/guild-schema";
import log from "../../dependencies/constants/logger";

export const prediction = {
    data: new SlashCommandBuilder()
        .setName('prediction')
        .setDescription('Create a prediction and gamble with your prediction points')
        .addStringOption(option =>
            option.setName('prediction')
                .setDescription('what you want to predict')
                .setRequired(true)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {

        const commandOptions = interaction.options as CommandInteractionOptionResolver // ts thinks the .get options don't exist
        const prompt = commandOptions.getString('prediction')

        const predictionEmbed = new EmbedBuilder()
            .setTitle(`${prompt}`)
            .addFields(
                {name: `Yes`, value: '[▱▱▱▱▱▱▱▱▱▱] 0%', inline: true},
                {name: `No`, value: '[▱▱▱▱▱▱▱▱▱▱] 0%', inline: true},
                {name: `\u200B`, value: '\u200B', inline: true},
                {name: `Believers`, value: '-', inline: true},
                {name: `Doubters`, value: '-', inline: true},
                {name: `\u200B`, value: '\u200B', inline: true},
            )
            .setFooter({text: `This prediction will be active for 2 min`})
            .setColor(embedColor)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`Yes`)
                    .setCustomId('predict-yes')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setLabel(`No`)
                    .setCustomId('predict-no')
                    .setStyle(ButtonStyle.Danger),
            );

        await interaction.reply({content: '*Prediction Active*'})
        const sent = await interaction.channel.send({embeds: [predictionEmbed], components: [row]})

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 8000, // 120 * 60000,
            filter: (i) => {
                if (i.message.id != sent.id) return false
                return ['predict-yes', 'predict-no'].includes(i.customId)
            }
        });
        const terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)

        let numberOfVotes = {
            choice1: 0, // yes (named this way bc of the updateProgressBars Function)
            choice2: 0, // no
            total: 0
        }

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

        collector.on('collect', async i => {
            if (pendingResponse.includes(i.user.id)) {
                await i.reply({content: `Please wait 15s before trying again`, ephemeral: true})
                return
            }

            const user = guildData.userData.find(user => user.id === i.user.id);
            if (user == undefined || JSON.stringify(user.predictionStats) === '{}') {
                await updateUserData(interaction, [i.user.id], UserInfo.PredictionCreate)
                waitForUpdate(guildData)
                guildData = await guilds.findOne({guildId: interaction.guildId})
            }

            const member = i.member as GuildMember;
            const isBeliever = i.customId === 'predict-yes';
            const targetArray = isBeliever ? believers : doubters;
            const targetIds = isBeliever ? believerIds : doubterIds;
            const targetFieldIndex = isBeliever ? 3 : 4;
            const targetEmoji = isBeliever ? client.emojis.cache.get("900906521800622121") : client.emojis.cache.get("877632254568964096")
            const progressBarCustomId = isBeliever ? 'choice1' : 'choice2'
            let userPoints = guildData.userData.find(user => user.id === i.user.id).predictionStats.points

            userPoints = userPoints == undefined ? 1000 : userPoints

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

            const filter = (modalInteraction) => modalInteraction.customId === 'betModal' && modalInteraction.user.id == i.user.id;
            i.awaitModalSubmit({filter, time: 15_000})
                .then(async (modalInteraction) => {
                    const input = modalInteraction.fields.getTextInputValue('amountInput')
                    const isNumeric = /^\d+$/.test(input);
                    const isAllIn = input.toLowerCase().replace(/\s/g, "") == 'allin'

                    if (isNumeric || isAllIn) {
                        const betAmount = isAllIn ? userPoints : parseInt(input, 10)
                        const replyString = isAllIn ? 'went all in' : `bet ${input} points`
                        const choice = isBeliever ? '**Yes**' : '**No**'

                        if (betAmount <= userPoints) {
                            await modalInteraction[modalInteraction.replied ? 'editReply' : 'reply']({
                                content: `you ${replyString} on **${choice}**`,
                                ephemeral: !modalInteraction.replied
                            });

                            targetArray.push(`> ${member.displayName} ${targetEmoji.toString()} *${betAmount} points* \n`);
                            targetIds.push(i.user.id);

                            isBeliever ? yesPool += betAmount : noPool += betAmount;
                            totalPool += betAmount

                            if (targetArray.length > 0) {
                                const winMultiplier = isBeliever ? totalPool / yesPool : totalPool / noPool;
                                const userType = isBeliever ? 'Believers' : 'Doubters'
                                predictionEmbed.data.fields[targetFieldIndex].name = `${userType} *(${winMultiplier.toFixed(1)}x multiplier)*`
                                predictionEmbed.data.fields[targetFieldIndex].value = targetArray.join('');
                            }

                            betAmountMap.set(i.user.id, betAmount)

                            if (predictors.has(i.user.id)) {
                                numberOfVotes[predictors.get(i.user.id)] -= 1;
                            } else {
                                numberOfVotes.total++
                            }
                            predictors.set(i.user.id, progressBarCustomId)
                            numberOfVotes[predictors.get(i.user.id)] += 1;
                            await updateProgressBars(sent, predictionEmbed, numberOfVotes, 2)
                        } else {
                            await modalInteraction[modalInteraction.replied ? 'editReply' : 'reply']({
                                content: `You don't have that many points pal. Try again`,
                                ephemeral: !modalInteraction.replied
                            });
                        }
                    } else {
                        await modalInteraction[modalInteraction.replied ? 'editReply' : 'reply']({
                            content: `Input a valid number.`,
                            ephemeral: !modalInteraction.replied
                        });
                        pendingResponse.splice(pendingResponse.indexOf(i.user.id), 1)
                    }
                    pendingResponse.splice(pendingResponse.indexOf(i.user.id), 1)
                })
                .catch(() => {
                    pendingResponse.splice(pendingResponse.indexOf(i.user.id), 1)
                })
        });

        collector.on('end', async () => {
            // send interaction to ask who won
            const selectWinnerButton = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel(`Choose Winner`)
                        .setCustomId('predict-choose')
                        .setStyle(ButtonStyle.Success),
                );

            sent.edit({components: [selectWinnerButton]})

            try {
                const selectCollectorFilter = async (i) => {
                    if (i.message.id != sent.id) return false // prevent simultaneous prompts from affecting each other
                    if (i.user.id != interaction.user.id) {
                        await interaction.channel.send(`Only the person who started the prediction can select the winner`)
                        return false
                    }
                    return ['predict-choose'].includes(i.customId);
                };
                const selectWinnerInteraction = await sent.awaitMessageComponent({
                    filter: selectCollectorFilter,
                    time: 3.6e+6
                })

                const winnerInteraction = await selectWinnerInteraction.reply({
                    content: 'Please select a winner (Only the person who created the prediction can choose).',
                    components: [row]
                });

                try {
                    await sent.edit({components: []})
                    const winCollectorFilter = async (i) => {
                        const message = await selectWinnerInteraction.fetchReply()
                        if (i.message.id != message.id || i.user.id != interaction.user.id) return false
                        return ['predict-yes', 'predict-no'].includes(i.customId);
                    };
                    const winCollector = await winnerInteraction.awaitMessageComponent({
                        filter: winCollectorFilter,
                        time: 120000
                    })
                    const winner = winCollector.customId == 'predict-yes' ? 'Yes' : 'No'
                    const winString = winner === 'Yes' ? `Belivers Win!` : 'Doubters Win!'

                    /*
                    Pari-mutuel betting system - the win/lose multipliers are determined by the total amount of money wagered on each outcome
                    Win Multiplier = (Total Pool - Deductions) / Amount Bet on the Winning Outcome
                     */
                    const winningPool = winner === 'Yes' ? yesPool : noPool
                    const winMultiplier = winningPool !== 0 ? totalPool / winningPool : 1;
                    let totalWinnings = 0

                    for (const [key, value] of betAmountMap.entries()) {
                        const winnings = (value * winMultiplier).toFixed(0)
                        totalWinnings += parseInt(winnings)
                    }

                    const peepoBus = client.emojis.cache.get("994786993777160263")
                    const what = client.emojis.cache.get("1117689831657578538")

                    await selectWinnerInteraction.editReply({
                        content: `${winString} ${what.toString()}.  ${totalWinnings} points distributed amongst winners.`,
                        components: []
                    });

                    const pointChangeMap = new Map<string, number>()

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
                } catch (e) {
                    sent.edit({components: []})
                    log.warn('Response Timeout')
                }
            } catch (e) {
                sent.edit({components: []})
                log.warn('Response Timeout')
            }
        })
    }
}
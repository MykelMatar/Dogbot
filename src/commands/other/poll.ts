import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    CommandInteractionOptionResolver,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
    Snowflake
} from "discord.js";
import {embedColor, NewClient, PollStats} from "../../dependencies/myTypes";
import {terminate, terminationListener} from "../../dependencies/helpers/otherHelpers/terminationListener";
import {updateProgressBars} from "../../dependencies/helpers/otherHelpers/updateProgressBars";

export const poll = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('generate an anonymous poll')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('The thing you are polling about')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('How long the poll should accept answers')
                .setRequired(true)
                .setChoices(
                    {name: '30 minutes', value: 30}, // time in minutes
                    {name: '1 hour', value: 1 * 60},
                    {name: '2 hours', value: 2 * 60},
                    {name: '3 hours', value: 3 * 60},
                    {name: '4 hours', value: 4 * 60},
                    {name: '5 hours', value: 5 * 60},
                    {name: '6 hours', value: 6 * 60},
                    {name: '7 hours', value: 7 * 60},
                    {name: '8 hours', value: 8 * 60},
                    {name: '9 hours', value: 9 * 60},
                    {name: '10 hours', value: 10 * 60},
                    {name: '11 hours', value: 11 * 60},
                    {name: '12 hours', value: 12 * 60},
                    {name: '13 hours', value: 13 * 60},
                    {name: '14 hours', value: 14 * 60},
                    {name: '15 hours', value: 15 * 60},
                    {name: '16 hours', value: 16 * 60},
                    {name: '17 hours', value: 17 * 60},
                    {name: '18 hours', value: 18 * 60},
                    {name: '19 hours', value: 19 * 60},
                    {name: '20 hours', value: 20 * 60},
                    {name: '21 hours', value: 21 * 60},
                    {name: '22 hours', value: 22 * 60},
                    {name: '23 hours', value: 23 * 60},
                    {name: '24 hours', value: 24 * 60},
                ))
        .addStringOption(option =>
            option.setName('choice1')
                .setDescription('1st answer')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('choice2')
                .setDescription('2nd answer')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('choice3')
                .setDescription('3rd answer')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('choice4')
                .setDescription('4th answer')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('choice5')
                .setDescription('5th answer')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction) {
        const commandOptions = interaction.options as CommandInteractionOptionResolver // ts thinks the .get options don't exist
        const prompt = commandOptions.getString('prompt')
        const time = commandOptions.getInteger('time')

        let allOptions = [
            commandOptions.getString('choice1'),
            commandOptions.getString('choice2'),
            commandOptions.getString('choice3') ?? undefined,
            commandOptions.getString('choice4') ?? undefined,
            commandOptions.getString('choice5') ?? undefined
        ]
        let choices = allOptions.filter(i => i !== undefined)

        let timeUnit = time < 60 ? 'minute' : 'hours';
        let fixedTime = timeUnit === 'hours' ? time / 60 : time;

        if (fixedTime === 1 && timeUnit === 'hours') {
            timeUnit = 'hour';
        }

        const pollEmbed = new EmbedBuilder()
            .setTitle(`${prompt}`)
            .setDescription(`This poll will be active for ${fixedTime} ${timeUnit}`)
            .addFields(
                {name: `[1] - ${choices[0]}`, value: '[▱▱▱▱▱▱▱▱▱▱] 0%'},
                {name: `[2] - ${choices[1]}`, value: '[▱▱▱▱▱▱▱▱▱▱] 0%'},
            )
            .setColor(embedColor)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`1`)
                    .setCustomId('choice1')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel(`2`)
                    .setCustomId('choice2')
                    .setStyle(ButtonStyle.Primary),
            );

        if (choices.length > 2) {
            for (let i = 2; i < choices.length; i++) {
                pollEmbed.addFields({name: `[${i + 1}] - ${choices[i]}`, value: '[▱▱▱▱▱▱▱▱▱▱] 0%'},)
                row.addComponents(
                    new ButtonBuilder()
                        .setLabel(`${i + 1}`)
                        .setCustomId(`choice${i + 1}`)
                        .setStyle(ButtonStyle.Primary))
            }
        }

        await interaction.reply({content: '*Poll Active*'})
        let sent = await interaction.channel.send({embeds: [pollEmbed], components: [row]})

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: time * 60000,
            filter: (i) => {
                if (i.message.id != sent.id) return false
                return ['choice1', 'choice2', 'choice3', 'choice4', 'choice5'].includes(i.customId)
            }
        });
        let terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)

        let numberOfVotes: PollStats = {
            choice1: 0,
            choice2: 0,
            choice3: 0,
            choice4: 0,
            choice5: 0,
            total: 0
        }

        let voters: Map<Snowflake, string> = new Map()

        collector.on('collect', async i => {
            await i.deferUpdate()

            if (voters.has(i.user.id)) {
                numberOfVotes[voters.get(i.user.id)] -= 1;
            } else {
                numberOfVotes.total++
            }
            voters.set(i.user.id, i.customId)
            numberOfVotes[voters.get(i.user.id)] += 1;

            await updateProgressBars(sent, pollEmbed, numberOfVotes, choices.length)
        });


        collector.on('end', async () => {
            await sent.edit({content: 'VOTING ENDED', components: []})

            let newMessage = await interaction.channel.send({content: 'Results:'})

            let maxVotes = -Infinity;
            let maxChoices = [];

            for (const choice in numberOfVotes) {
                if (choice !== 'total' && numberOfVotes[choice] >= maxVotes) {
                    if (numberOfVotes[choice] > maxVotes) {
                        maxVotes = numberOfVotes[choice];
                        maxChoices = [choice];
                    } else {
                        // Tie with current maxVotes, add the choice to the ties
                        maxChoices.push(choice);
                    }
                }
            }

            const resultsEmbed = new EmbedBuilder()
                .setTitle(`Poll Results:`)
                .setDescription(`${prompt}: {}`)
                .addFields(
                    {name: `[1] - ${choices[0]}`, value: '[▱▱▱▱▱▱▱▱▱▱] 0%'},
                    {name: `[2] - ${choices[1]}`, value: '[▱▱▱▱▱▱▱▱▱▱] 0%'},
                )
                .setColor(embedColor)

            let winningChoices: any[] = []
            if (maxChoices.length > 1) { // tie
                for (let i = 0; i < maxChoices.length; i++) {
                    winningChoices.push(`**${interaction.options.data.find(option => option.name == maxChoices[i]).value}**`)
                }
                resultsEmbed.data.description = `${prompt}: TIED between ${winningChoices.join(' and ')}`
            } else { // winner
                winningChoices.push(`**${interaction.options.data.find(option => option.name == maxChoices[0]).value}**`)
                resultsEmbed.data.description = `${prompt}: ${winningChoices} Wins!`
            }

            if (choices.length > 2) {
                for (let i = 2; i < choices.length; i++) {
                    resultsEmbed.addFields({name: `[${i + 1}] - ${choices[i]}`, value: '[▱▱▱▱▱▱▱▱▱▱] 0%'},)
                    row.addComponents(
                        new ButtonBuilder()
                            .setLabel(`${i + 1}`)
                            .setCustomId(`choice${i + 1}`)
                            .setStyle(ButtonStyle.Primary))
                }
            }

            await updateProgressBars(newMessage, resultsEmbed, numberOfVotes, choices.length)
            newMessage.edit({embeds: [resultsEmbed]})
        })
    }
}
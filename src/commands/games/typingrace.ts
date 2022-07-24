import {TypingRacer} from "../../dependencies/classes/TypingRacer";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, CommandInteraction, SlashCommandBuilder} from "discord.js";
import {Actions, updateTypeRaceUserArray} from "../../dependencies/helpers/updateTypeRaceUserArray"
import {StatName} from "../../dependencies/helpers/updateUserData";
import {newClient} from "../../dependencies/myTypes";


export const typingrace = {
    data: new SlashCommandBuilder()
        .setName('typing-race')
        .setDescription('Starts a typing race for users to participate in'),

    async execute(client: newClient, message: CommandInteraction) {
        // generate buttons
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('signup')
                    .setLabel('Sign Up')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('undo')
                    .setLabel('Undo Sign Up')
                    .setStyle(ButtonStyle.Danger),
            );

        // generate embed
        const signUpEmbed = new EmbedBuilder()
            .setTitle('Typing Race')
            .addFields({name: 'Racers', value: '-'})
            .setColor('#B8CAD1')

        let sent = await message.channel.send({
            content: 'Race will begin in 20 seconds',
            embeds: [signUpEmbed],
            components: [row]
        })

        // create collector
        const signUpCollector = message.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 20000
        });

        // collect response
        let racers: string[] = ['-'];
        let racerIds: string[] = [];

        signUpCollector.on('collect', async i => {
            await i.deferUpdate(); // prevents "this message failed" message from appearing
            if (i.customId === 'signup') {
                await updateTypeRaceUserArray(i, racers, racerIds, Actions.add)
            } else if (i.customId === 'undo') {
                await updateTypeRaceUserArray(i, racers, racerIds, Actions.remove)
            }

            signUpEmbed.data.fields[0].value = racers.join('');
            await sent.edit({embeds: [signUpEmbed], components: [row]});
        });

        signUpCollector.on('end', async () => {
            await sent.edit({content: 'race starting', embeds: [signUpEmbed]})   // remove buttons
            if (racers[0] == '-') {
                await sent.edit({content: 'no racers signed up', embeds: [], components: []})
                return
            }

            // generate prompt 
            let prompt: string = words[Math.floor(Math.random() * words.length)]
            for (let i = 0; i < 50; i++) {
                prompt += ' ' + (words[Math.floor(Math.random() * words.length)])
            }

            const promptEmbed = new EmbedBuilder()
                .addFields({name: 'Prompt', value: prompt})
                .setColor('#B8CAD1')

            await sent.edit({content: 'sign-up ended', embeds: [signUpEmbed, promptEmbed], components: []})   // remove buttons

            const filter = m => !(m.author.bot) && racerIds.includes(m.author.id)
            const promptCollector = message.channel.createMessageCollector({filter, time: 60000}) // 1 min timer (60000 ms)
            const startDate = new Date()
            let submissionTime: number,
                accuracy: number,
                characterCount: number,
                errors: number,
                rawWPM: number,
                netWPM: number,
                endRace: boolean = false,
                collectedUsers: string[] = [],
                typingRacers: TypingRacer[] = []

            promptCollector.on('collect', async m => {
                // @ts-ignore
                submissionTime = (m.createdAt - startDate) / 60000 // time it took to submit in minutes
                accuracy = similarity(prompt, m.content)
                characterCount = m.content.length
                errors = Math.round((1 - accuracy) * prompt.length)

                if (submissionTime < .27 && accuracy > .98) { // if user submission is faster than 16.2 seconds
                    rawWPM = 0
                    netWPM = 0
                    await m.channel.send('submission disqualified. Please refrain from copy pasting the prompt.')
                    return
                }
                accuracy = parseFloat(accuracy.toFixed(4)) // convert accuracy to a more readable number after it's used to calculate error for mongo pushing and embed display
                if (errors > 30) {
                    rawWPM = 0
                    netWPM = 0
                    await m.channel.send('submissions with greater than 30 errors do not count, be accurate')
                    return
                } else {
                    // rawWPM = (All Typed Entries / 5) / time (min), where All Typed Entries is the no. of characters
                    rawWPM = parseFloat(((characterCount / 5) / submissionTime).toFixed(2))
                    // netWPM = rawWPM - (uncorrected errors / time (min))
                    netWPM = parseFloat((rawWPM - (errors / submissionTime)).toFixed(2))

                    const statsEmbed = new EmbedBuilder()
                        .setTitle(`${m.author.username}'s stats`)
                        .addFields(
                            {name: 'WPM', value: netWPM.toString(), inline: true},
                            {name: 'Accuracy⠀⠀', value: `${(accuracy * 100)}%`, inline: true},
                            {name: 'time', value: `${(submissionTime * 60).toFixed(2)}s`, inline: true},
                            {name: 'raw WPM⠀⠀', value: rawWPM.toString(), inline: true},
                            {name: 'errors', value: errors.toString(), inline: true},
                            {name: 'characters', value: `${characterCount} / ${prompt.length}`, inline: true},
                        )
                        .setColor('#B8CAD1')
                    await m.channel.send({content: `submission received`, embeds: [statsEmbed]})

                    typingRacers.push(new TypingRacer(m.author.username, m.author.id, netWPM, rawWPM, accuracy))
                }

                // prevent users from submitting more than once
                if (!(collectedUsers.includes(m.author.id))) {
                    collectedUsers.push(m.author.id)
                }

                // check if every user has submitted something
                // racerIds.sort().every((element, index) => {
                //     if (element == (collectedUsers.sort())[index]) return endRace = true;
                // })
                // if (endRace === true) promptCollector.stop()

                promptCollector.filter = m => !(m.author.bot) && !(collectedUsers.includes(m.author.id))

            })

            promptCollector.on('end', async () => {
                let highestWPM: number = 0;
                typingRacers.forEach(racer => {
                    if (racer.WPM > highestWPM) highestWPM = racer.WPM
                })

                let winner = typingRacers.find(racer => racer.WPM === highestWPM)
                winner.isWinner = true;
                for (const typingRacer of typingRacers) {
                    if (typingRacer.isWinner === true) {
                        await typingRacer.updateUserData(message, StatName.trWins)
                    } else {
                        await typingRacer.updateUserData(message, StatName.trLosses)
                    }
                }
            })
        }); // end signUpCollector.on('end')
    }
}


// top 200 most common words
const words: string[] = ['the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'I',
    'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'from', 'or', 'which', 'one',
    'would', 'all', 'will', 'there', 'say', 'who', 'make', 'when', 'can', 'more', 'if', 'no', 'man', 'out', 'other',
    'so', 'what', 'time', 'up', 'go', 'about', 'than', 'into', 'could', 'state', 'only', 'new', 'year', 'some', 'take',
    'come', 'these', 'know', 'see', 'use', 'get', 'like', 'then', 'first', 'any', 'work', 'now', 'may', 'such', 'give',
    'over', 'think', 'most', 'even', 'find', 'day', 'also', 'after', 'way', 'many', 'must', 'look', 'before', 'great',
    'back', 'through', 'long', 'where', 'much', 'should', 'well', 'people', 'down', 'own', 'just', 'because', 'good',
    'each', 'those', 'feel', 'seem', 'how', 'high', 'too', 'place', 'little', 'world', 'very', 'still', 'nation',
    'hand', 'old', 'life', 'tell', 'write', 'become', 'here', 'show', 'house', 'both', 'between', 'need', 'mean',
    'call', 'develop', 'under', 'last', 'right', 'right', 'move', 'thing', 'general', 'school', 'never', 'same',
    'another', 'begin', 'while', 'number', 'part', 'turn', 'real', 'leave', 'might', 'want', 'point', 'form', 'off',
    'child', 'few', 'small', 'since', 'against', 'ask', 'late', 'home', 'interest', 'large', 'person', 'end', 'open',
    'public', 'follow', 'during', 'present', 'without', 'again', 'hold', 'govern', 'around', 'possible', 'head',
    'consider', 'word', 'program', 'problem', 'however', 'lead', 'system', 'set', 'order', 'eye', 'plan', 'run', 'keep',
    'face', 'fact', 'group', 'play', 'stand', 'increase', 'early', 'course', 'change', 'help', 'line']

function similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
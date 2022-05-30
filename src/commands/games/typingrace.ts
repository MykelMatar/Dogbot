import {Command} from "../../dependencies/classes/Command";
import {TypingRacer} from "../../dependencies/classes/TypingRacer";
import {MessageActionRow, MessageButton, MessageEmbed} from "discord.js";
import {Actions, updateTypeRaceUserArray} from "../../dependencies/helpers/updateTypeRaceUserArray"
import {StatName} from "../../dependencies/helpers/updateUserData";

export const typingrace = new Command(
    'typing-race',
    'creates a typing race between different users',
    async (client, message) => {

        // create sign up prompt
        // generate buttons
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('signup')
                    .setLabel('Sign Up')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('undo')
                    .setLabel('Undo Sign Up')
                    .setStyle('DANGER'),
            );

        // generate embed
        const signUpEmbed = new MessageEmbed()
            .setTitle('Typing Race')
            .addField('Racers', '-')
            .setColor("#8570C1")

        let sent = await message.channel.send({content:'Race will begin in 20 seconds' , embeds: [signUpEmbed], components: [row]})

        // create collector
        const signUpCollector = message.channel.createMessageComponentCollector({componentType: 'BUTTON', time: 20000});

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

            signUpEmbed.fields[0].value = racers.join('');
            await sent.edit({embeds: [signUpEmbed], components: [row]});
        });

        signUpCollector.on('end', async collected => {
            await sent.edit({content: 'race starting', embeds: [signUpEmbed]})   // remove buttons
            if (racers[0] == '-') {
                await sent.edit({content: 'no racers signed up', embeds: [], components: []})
                return
            }

            // generate prompt 
            let prompt: string = words[Math.floor(Math.random() * words.length)]
            for (let i = 0; i < 100; i++) {
                prompt += ' ' + (words[Math.floor(Math.random() * words.length)])
            }

            const promptEmbed = new MessageEmbed()
                // @ts-ignore
                .addField('Prompt', prompt)
                .setColor("#8570C1")

            await sent.edit({content: 'enlisting ended', embeds: [signUpEmbed, promptEmbed]})   // remove buttons

            const filter = m => !m.author.bot && racerIds.includes(m.author.id)
            const promptCollector = message.channel.createMessageCollector({filter, time: 120000}) // 2 min timer (120000 ms)
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
                accuracy = parseFloat(accuracy.toFixed(4)) // convert accuracy to a more readable number after it's used to calculate error for mongo pushing and embed display

                if (submissionTime < .167 && accuracy > .96) { // if user submission is faster than 15 seconds
                    rawWPM = 0
                    netWPM = 0
                    await m.channel.send('submission disqualified. Please refrain from copy pasting the prompt.')
                }
                if (errors > 30) {
                    rawWPM = 0
                    netWPM = 0
                    await m.channel.send('submissions with greater than 30 errors do not count, be accurate')
                } else {
                    // rawWPM = (All Typed Entries / 5) / time (min), where All Typed Entries is the no. of characters
                    rawWPM = parseFloat(((characterCount / 5) / submissionTime).toFixed(2))
                    // netWPM = rawWPM - (uncorrected errors / time (min))
                    netWPM = parseFloat((rawWPM - (errors / submissionTime)).toFixed(2))

                    const statsEmbed = new MessageEmbed()
                        .setTitle(`${m.author.username}'s stats`)
                        .addFields(
                            {name: 'WPM', value: netWPM.toString(), inline: true},
                            {name: 'Accuracy⠀⠀', value: `${(accuracy * 100)}%`, inline: true},
                            {name: 'time', value: `${(submissionTime * 60).toFixed(2)}s`, inline: true},
                            {name: 'raw WPM⠀⠀', value: rawWPM.toString(), inline: true},
                            {name: 'errors', value: errors.toString(), inline: true},
                            {name: 'characters', value: `${characterCount} / ${prompt.length}`, inline: true},
                        )
                        .setColor("#8570C1")
                    await m.channel.send({content: `submission received`, embeds: [statsEmbed]})

                    typingRacers.push(new TypingRacer(m.author.username, m.author.id, netWPM, rawWPM, accuracy))
                }

                // prevent users from submitting more than once
                if (!(collectedUsers.includes(m.author.id))) {
                    collectedUsers.push(m.author.id)
                }
                // check if every user has submitted something
                racerIds.sort().every((element, index) => {
                    if (element == (collectedUsers.sort())[index]) return endRace = true;
                })
                if (endRace === true) promptCollector.stop()

                promptCollector.filter = m => !(collectedUsers.includes(m.author.id))
                // check for user submissions faster than 20s (probably cheaters)

            })

            promptCollector.on('end', async collected => {
                let highestWPM: number = 0;
                typingRacers.forEach(racer => {
                    if (racer.WPM > highestWPM) highestWPM = racer.WPM
                    console.log(racer.name)
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
)

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
import {EmbedBuilder, Message} from "discord.js";
import {PollStats} from "../../myTypes";

export async function updateProgressBars(interaction: Message, embed: EmbedBuilder, numberOfVotes: Partial<PollStats>, numBars: number, isPrediction: boolean = false) {
    const fillChar = '▰'
    const emptyChar = '▱'

    let progressBars = {
        choice1Bar: [],
        choice2Bar: [],
        choice3Bar: [],
        choice4Bar: [],
        choice5Bar: []
    }

    const barFillAmounts: number[] = [];
    for (let i = 1; i <= numBars; i++) {
        const fillAmount = (numberOfVotes[`choice${i}`] / numberOfVotes.total) * 10;
        barFillAmounts.push(fillAmount);
    }

    const stopIndex = numBars + 1
    let index = 0

    const barArrays = Object.values(progressBars);
    for (const key in barArrays) {
        if (index > stopIndex) {
            break;
        }

        const progressBar = barArrays[key];

        for (let i = 0; i < Math.round(barFillAmounts[index]); i++) {
            progressBar.push(fillChar);
        }
        for (let i = Math.round(barFillAmounts[index]); i < 10; i++) {
            progressBar.push(emptyChar);
        }
        index++;
    }

    if (!isPrediction) {
        for (let i = 0; i < numBars; i++) {
            const numVotes = numberOfVotes[`choice` + (i + 1)] ? numberOfVotes[`choice${i + 1}`] : 0
            embed.data.fields[i].value = `[${progressBars[`choice${i + 1}Bar`].join('')}] **${(barFillAmounts[i] * 10).toFixed(2)} %**\n*(${numVotes} votes)*`
        }
    } else {
        embed.data.fields[0].value = `[${progressBars[`choice${1}Bar`].join('')}] ${(barFillAmounts[0] * 10).toFixed(2)}%`
        embed.data.fields[2].value = `[${progressBars[`choice${2}Bar`].join('')}] ${(barFillAmounts[1] * 10).toFixed(2)}%`
    }

    await interaction.edit({embeds: [embed]})
}
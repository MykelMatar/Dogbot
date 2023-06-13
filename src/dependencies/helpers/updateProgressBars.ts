export async function updateProgressBars(interaction, embed, pollStats, numBars: number) {
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
        const fillAmount = (pollStats[`choice${i}`] / pollStats.total) * 10;
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

    for (let i = 0; i < numBars; i++) {
        embed.data.fields[i].value = `[${progressBars[`choice${i + 1}Bar`].join('')}] ${(barFillAmounts[i] * 10).toFixed(2)}%`

    }
    await interaction.edit({embeds: [embed]})
}
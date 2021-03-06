// @ts-nocheck - compiler does not understand that the row components are message buttons
import {MessageActionRow, MessageButton} from "discord.js";
import {Command} from "../../dependencies/classes/Command";
import {StatName, updateUserData} from "../../dependencies/helpers/updateUserData";

let selected = Array(9).fill(false)
let color = 'SUCCESS';
let symbol = 'O';
let win = false
let turn = 1;
let winner, loser, user, selectedRow, index
let cmdStatus = 0;

//TODO: create /endtictactoe command or timeout after 15s of nothing happening
export const tictactoe = new Command(
    'tictactoe',
    'starts a tic tac toe game against another member',
    async (client, interaction) => {
        if (cmdStatus === 1) await interaction.editReply('please wait for current game to finish')
        cmdStatus = 1;

        // @ts-ignore
        let opponent = interaction.options.data[0].member.user.username;
        console.log(opponent)

        // generate buttons
        const row1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('TL')
                    .setLabel(' ')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('TM')
                    .setLabel('  ')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('TR')
                    .setLabel('   ')
                    .setStyle('SECONDARY'),
            );
        
        const row2 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('ML')
                    .setLabel('    ')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('MM')
                    .setLabel('     ')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('MR')
                    .setLabel('      ')
                    .setStyle('SECONDARY'),
            );

        const row3 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('BL')
                    .setLabel('      ')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('BM')
                    .setLabel('       ')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('BR')
                    .setLabel('        ')
                    .setStyle('SECONDARY'),
            );

        // create board
        await interaction.reply({
            content: `${interaction.member.user.username} vs ${opponent}`,
            components: [row1, row2, row3]
        })

        const filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({filter, componentType: 'BUTTON'});

        // start game
        collector.on('collect', async i => {
            await i.deferUpdate() // prevents "this interaction failed" message from appearing
                .catch(error => console.log(error));

            // interaction handling
            switch (i.customId) {
                case 'TL':
                    if (selected[0]) return;
                    selectedRow = row1
                    index = 0
                    selected[0] = true;
                    break;
                case 'TM':
                    if (selected[1]) return;
                    selectedRow = row1;
                    index = 1
                    selected[1] = true;
                    break;
                case 'TR':
                    if (selected[2]) return;
                    selectedRow = row1;
                    index = 2
                    selected[2] = true;
                    break;
                case 'ML':
                    if (selected[3]) return;
                    selectedRow = row2;
                    index = 0
                    selected[3] = true;
                    break;
                case 'MM':
                    if (selected[4]) return;
                    selectedRow = row2;
                    index = 1
                    selected[4] = true;
                    break;
                case 'MR':
                    if (selected[5]) return;
                    selectedRow = row2;
                    index = 2
                    selected[5] = true;
                    break;
                case 'BL':
                    if (selected[6]) return;
                    selectedRow = row3;
                    index = 0
                    selected[6] = true;
                    break;
                case 'BM':
                    if (selected[7]) return;
                    selectedRow = row3;
                    index = 1
                    selected[7] = true;
                    break;
                case 'BR':
                    if (selected[8]) return;
                    selectedRow = row3;
                    index = 2
                    selected[8] = true;
                    break;
                default:
                    return
            }

            selectedRow.components[index].label = symbol
            selectedRow.components[index].style = color
            await changeTurn(interaction, client)

            await interaction.editReply({
                content: `${interaction.member.user.username} vs ${opponent}`,
                components: [row1, row2, row3]
            });

            collector.filter = i => i.user.id === user // change filter to only accept correct player's input

            // win logic
            if (row1.components[1].label === row2.components[1].label && // 3 in a row vertically left column
                row1.components[1].label === row3.components[1].label) {
                await endGame(interaction, collector)
            } else if (row1.components[1].label === row2.components[1].label && // 3 in a row vertically middle column
                row1.components[1].label === row3.components[1].label) {
                await endGame(interaction, collector)
            } else if (row1.components[2].label === row2.components[2].label && // 3 in a row vertically right column
                row2.components[2].label === row3.components[2].label) {
                await endGame(interaction, collector)
            } else if (row1.components[0].label === row1.components[1].label && // 3 in a row horizontally top row
                row1.components[0].label === row1.components[2].label) {
                await endGame(interaction, collector)
            } else if (row2.components[0].label === row2.components[1].label && // 3 in a row horizontally middle row
                row2.components[0].label === row2.components[2].label) {
                await endGame(interaction, collector)
            } else if (row3.components[0].label === row3.components[1].label && // 3 in a row horizontally bottom row
                row3.components[0].label === row3.components[2].label) {
                await endGame(interaction, collector)
            } else if (row1.components[0].label === row2.components[1].label && // 3 in a row diagonally -slope
                row1.components[0].label === row3.components[2].label) {
                await endGame(interaction, collector)
            } else if (row1.components[2].label === row2.components[1].label && // 3 in a row diagonally +slope
                row1.components[2].label === row3.components[0].label) {
                await endGame(interaction, collector)
            }
        });

        collector.on('end', async () => {
            if (win === false)
                await interaction.editReply({content: 'Tie!'})
        });
    }
)


// helper functions
async function changeTurn(interaction, client) {
    // change turns
    if (turn === 1) turn = 2
    else turn = 1

    // set color and symbol
    if (turn === 1) {
        symbol = 'O'
        color = 'SUCCESS'
    } else {
        symbol = 'X'
        color = "DANGER"
    }

    // turn logic
    if (turn === 1) user = interaction.member.user.id
    else if (turn === 2 && !(interaction.options._hoistedOptions[0] === undefined)) // if its 2nd player's turn, and they're not a  bot
        user = interaction.options._hoistedOptions[0].value
    else if (turn === 2 && interaction.options._hoistedOptions[0] === undefined) // if its 2nd player's turn, and they're a  bot
        user = client.user.id
}


async function endGame(interaction, collector) {
    // set winner to write to json and display
    if (turn === 2) {
        winner = interaction.user.id
        loser = user
    } else if (turn === 1) {
        winner = user
        loser = interaction.user.id
    }

    let username = (interaction.guild.members.cache.get(winner)).user.username // convert id to username to display
    await interaction.editReply({content: `${username} Wins!`})

    win = true; // set win to prevent tie message
    collector.stop(); // end collection

    // update tic tac toe user data
    await updateUserData(interaction, [winner], StatName.tttWins)
    await updateUserData(interaction, [loser], StatName.tttLosses)

    // reset game options
    selected = Array(9).fill(false)
    color = 'SUCCESS';
    symbol = 'O';
    win = false
    turn = 1;
    cmdStatus = 0;
}
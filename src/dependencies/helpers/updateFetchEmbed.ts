import {EnlistUserData} from "../myTypes";
import {ButtonInteraction, EmbedBuilder, Message} from "discord.js";

/**
 * updates the arrays used to display names in the fetch prompt. Also updates the ID arrays used
 * to update info in MongoDB
 *
 * @param interaction button interaction
 * @param embed embed in the enlistPrompt message
 * @param enlistUserData object that stores all the user info arrays
 * @param enlistPrompt message containing embed and buttons
 */

export async function updateFetchEmbed(interaction: ButtonInteraction, embed: EmbedBuilder, enlistUserData: EnlistUserData, enlistPrompt: Message) {
    const {
        enlistedUsers,
        enlistedUserIds,
        rejectedUsers,
        rejectedUserIds,
        potentialUsers,
        potentialUserIds,
        userAvailabilityMap
    } = enlistUserData

    let selectedUserArray: string[],
        selectedUserIdArray: string[],
        secondUserArray: string[],
        secondUserIdArray: string[],
        thirdUserArray: string[],
        thirdUserIdArray: string[]
    let perhapsFlag: boolean
    const userString: string = `> ${interaction.user.username}\n`
    const userTime: string | undefined = userAvailabilityMap.get(interaction.user.id)
    const potentialUserString: string = `> ${interaction.user.username} ~${userTime}\n`

    if (interaction.customId === 'Gamer') {
        perhapsFlag = false
        selectedUserArray = enlistedUsers
        selectedUserIdArray = enlistedUserIds
        secondUserArray = rejectedUsers
        secondUserIdArray = rejectedUserIds
        thirdUserArray = potentialUsers
        thirdUserIdArray = potentialUserIds
    } else if (interaction.customId === 'Cringe') {
        perhapsFlag = false
        selectedUserArray = rejectedUsers
        selectedUserIdArray = rejectedUserIds
        secondUserArray = enlistedUsers
        secondUserIdArray = enlistedUserIds
        thirdUserArray = potentialUsers
        thirdUserIdArray = potentialUserIds
    } else if (interaction.customId === 'Perhaps') {
        perhapsFlag = true
        selectedUserArray = potentialUsers
        selectedUserIdArray = potentialUserIds
        secondUserArray = enlistedUsers
        secondUserIdArray = enlistedUserIds
        thirdUserArray = rejectedUsers
        thirdUserIdArray = rejectedUserIds
    } else return

    if (!perhapsFlag) {
        if (!selectedUserArray.includes(userString)) {
            selectedUserArray.push(userString)
            selectedUserIdArray.push(interaction.user.id)
        }
        if (thirdUserArray.includes(potentialUserString)) {
            thirdUserArray.splice(thirdUserArray.indexOf(potentialUserString), 1)
            thirdUserIdArray.splice(thirdUserIdArray.indexOf(interaction.user.id, 1))
            if (userTime != undefined) {
                userAvailabilityMap.delete(interaction.user.id)
            }
        }
    }

    if (selectedUserArray.length === 0) {
        selectedUserArray.push('-')
    } else if (selectedUserArray.includes('-')) {
        selectedUserArray.splice(selectedUserArray.indexOf('-'), 1);
    }
    if (secondUserArray.includes(userString)) {
        secondUserArray.splice(secondUserArray.indexOf(userString), 1)
        secondUserIdArray.splice(secondUserIdArray.indexOf(interaction.user.id, 1))
    }
    if (thirdUserArray.includes(userString)) {
        thirdUserArray.splice(secondUserArray.indexOf(potentialUserString), 1)
        thirdUserIdArray.splice(secondUserIdArray.indexOf(interaction.user.id, 1))
    }
    if (secondUserArray.length === 0) {
        secondUserArray.push('-')
    }
    if (thirdUserArray.length === 0) {
        thirdUserArray.push('-')
    }

    embed.data.fields[0].value = enlistedUsers.join('');
    embed.data.fields[1].value = rejectedUsers.join('');
    embed.data.fields[2].value = potentialUsers.join('');

    await enlistPrompt.edit({embeds: [embed]});
}
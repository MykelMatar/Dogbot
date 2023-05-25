import {EnlistUserData} from "../myTypes";
import {ButtonInteraction, EmbedBuilder, Message, Role} from "discord.js";

/**
 * updates the arrays used to display names in the fetch prompt. Also updates the ID arrays used
 * to update info in MongoDB
 *
 * @param interaction button interaction
 * @param embed embed in the enlistPrompt message
 * @param enlistUserData object that stores all the user info arrays
 * @param enlistPrompt message containing embed and buttons
 * @param row row of buttons
 * @param role role being mentioned in the message
 */
export async function updateEnlistUserEmbed(interaction: ButtonInteraction, embed: EmbedBuilder, enlistUserData: EnlistUserData, enlistPrompt: Message, row, role: string | Role) {
    let selectedUserArray: string[],
        selectedUserIdArray: string[],
        secondUserArray: string[],
        secondUserIdArray: string[],
        thirdUserArray: string[],
        thirdUserIdArray: string[]
    let perhapsFlag: boolean
    const userString: string = `> ${interaction.user.username}\n`
    const userTime: string | undefined = enlistUserData.userAvailabilityMap.get(interaction.user.id) // can be undefined
    const potentialUserString: string = `> ${interaction.user.username} ~${userTime}\n`

    if (interaction.customId === 'Gamer') {
        perhapsFlag = false
        selectedUserArray = enlistUserData.enlistedUsers
        selectedUserIdArray = enlistUserData.enlistedUserIds
        secondUserArray = enlistUserData.rejectedUsers
        secondUserIdArray = enlistUserData.rejectedUserIds
        thirdUserArray = enlistUserData.potentialUsers
        thirdUserIdArray = enlistUserData.potentialUserIds
    } else if (interaction.customId === 'Cringe') {
        perhapsFlag = false
        selectedUserArray = enlistUserData.rejectedUsers
        selectedUserIdArray = enlistUserData.rejectedUserIds
        secondUserArray = enlistUserData.enlistedUsers
        secondUserIdArray = enlistUserData.enlistedUserIds
        thirdUserArray = enlistUserData.potentialUsers
        thirdUserIdArray = enlistUserData.potentialUserIds
    } else if (interaction.customId === 'Perhaps') {
        perhapsFlag = true
        selectedUserArray = enlistUserData.potentialUsers
        selectedUserIdArray = enlistUserData.potentialUserIds
        secondUserArray = enlistUserData.enlistedUsers
        secondUserIdArray = enlistUserData.enlistedUserIds
        thirdUserArray = enlistUserData.rejectedUsers
        thirdUserIdArray = enlistUserData.rejectedUserIds
    } else return

    if (perhapsFlag) {
        if (!selectedUserArray.includes(potentialUserString)) {
            selectedUserArray.push(potentialUserString)
            selectedUserIdArray.push(interaction.user.id)
        }
    } else {
        if (!selectedUserArray.includes(userString)) {
            selectedUserArray.push(userString)
            selectedUserIdArray.push(interaction.user.id)
        }
        if (thirdUserArray.includes(potentialUserString)) {
            thirdUserArray.splice(secondUserArray.indexOf(potentialUserString), 1)
            thirdUserIdArray.splice(secondUserIdArray.indexOf(interaction.user.id, 1))
            if (userTime != undefined) {
                enlistUserData.userAvailabilityMap.delete(interaction.user.id)
            }
        }
    }

    if (selectedUserArray.length === 0) { // make sure array 1 is never empty (discord requires fields to have >= 1char)
        selectedUserArray.push('-')
    }
    if (secondUserArray.includes(userString)) { // removes user from other array to ensure there are no duplicates
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
    if (selectedUserArray.length > 1 && selectedUserArray.includes('-')) {  // removes extra dash if a user is in the array
        selectedUserArray.splice(selectedUserArray.indexOf('-'), 1)
    }
    embed.data.fields[0].value = enlistUserData.enlistedUsers.join('');
    embed.data.fields[1].value = enlistUserData.rejectedUsers.join('');
    embed.data.fields[2].value = enlistUserData.potentialUsers.join('');

    await enlistPrompt.edit({content: `${role}`, embeds: [embed], components: [row]});
}
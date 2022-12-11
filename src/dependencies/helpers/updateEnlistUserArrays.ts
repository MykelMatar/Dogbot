import {EnlistUserInfoArrays} from "../myTypes";
import {ButtonInteraction} from "discord.js";

/**
 * updates the arrays used to display names in the enlist prompt. Also updates the ID arrays used 
 * to update info in MongoDB
 * 
 * @param interaction button interaction
 * @param userArrays object that stores all the user info arrays
 */
export async function updateEnlistUserArrays(interaction: ButtonInteraction, userArrays: EnlistUserInfoArrays) {
    let selectedUserArray, selectedUserIdArray, otherUserArray, otherUserIdArray, lastUserArray, lastUserIdArray

    if (interaction.customId === 'Gamer') {
        selectedUserArray = userArrays.enlistedUsers
        selectedUserIdArray = userArrays.enlistedUserIds
        otherUserArray = userArrays.rejectedUsers
        otherUserIdArray = userArrays.rejectedUserIds
        lastUserArray = userArrays.potentialUsers
        lastUserIdArray = userArrays.potentialUserIds
    }
    if (interaction.customId === 'Cringe') {
        selectedUserArray = userArrays.rejectedUsers
        selectedUserIdArray = userArrays.rejectedUserIds
        otherUserArray = userArrays.enlistedUsers
        otherUserIdArray = userArrays.enlistedUserIds
        lastUserArray = userArrays.potentialUsers
        lastUserIdArray = userArrays.potentialUserIds
    }
    if (interaction.customId === 'Perhaps') {
        selectedUserArray = userArrays.potentialUsers
        selectedUserIdArray = userArrays.potentialUserIds
        otherUserArray = userArrays.enlistedUsers
        otherUserIdArray = userArrays.enlistedUserIds
        lastUserArray = userArrays.rejectedUsers
        lastUserIdArray = userArrays.rejectedUserIds
    }

    if (!selectedUserArray.includes('> ' + interaction.user.username + '\n')) { // checks if user is in array 1 before adding them
        selectedUserArray.push('> ' + interaction.user.username + '\n')
        selectedUserIdArray.push(interaction.user.id)
    }
    if (selectedUserArray.length === 0) { // makes sure array 1 is never empty
        selectedUserArray.push('-')
    }
    if (otherUserArray.includes('> ' + interaction.user.username + '\n')) { // removes user from other array to ensure there are no duplicates
        otherUserArray.splice(otherUserArray.indexOf('> ' + interaction.user.username + '\n'), 1)
        otherUserIdArray.splice(otherUserIdArray.indexOf(interaction.user.id, 1))
    }
    if (lastUserArray.includes('> ' + interaction.user.username + '\n')) { // removes user from other array to ensure there are no duplicates
        lastUserArray.splice(otherUserArray.indexOf('> ' + interaction.user.username + '\n'), 1)
        lastUserIdArray.splice(otherUserIdArray.indexOf(interaction.user.id, 1))
    }
    if (otherUserArray.length === 0) { // makes sure array 2 is never empty (will return error)
        otherUserArray.push('-')
    }
    if (lastUserArray.length === 0) { // makes sure array 3 is never empty
        lastUserArray.push('-')
    }
    if (selectedUserArray.length > 1 && selectedUserArray.includes('-')) {  // removes extra dash if a user is in the array
        selectedUserArray.splice(selectedUserArray.indexOf('-'), 1)
    }
}
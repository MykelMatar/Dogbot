

export async function updateEnlistUserArrays(interaction, enlistedUsers, rejectedUsers, enlistedUserIds, rejectedUserIds) {
    let selectedUserArray, selectedUserIdArray, otherUserArray, otherUserIdArray

    if (interaction.customId === 'Enlist') {
        selectedUserArray = enlistedUsers
        selectedUserIdArray = enlistedUserIds
        otherUserArray = rejectedUsers
        otherUserIdArray = rejectedUserIds
    }
    if (interaction.customId === 'Reject') {
        selectedUserArray = rejectedUsers
        selectedUserIdArray = rejectedUserIds
        otherUserArray = enlistedUsers
        otherUserIdArray = enlistedUserIds
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
    if (otherUserArray.length === 0) { //makes sure array 2 is never empty
        otherUserArray.push('-')
    }
    if (selectedUserArray.length > 1 && selectedUserArray.includes('-')) {  //removes extra dash if a user is in the array
        selectedUserArray.splice(selectedUserArray.indexOf('-'), 1)
    }
}
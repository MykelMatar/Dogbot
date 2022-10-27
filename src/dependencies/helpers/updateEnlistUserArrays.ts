export async function updateEnlistUserArrays(interaction, userArrays) {
    let selectedUserArray, selectedUserIdArray, otherUserArray, otherUserIdArray, lastUserArray, lastUserIdArray

    if (interaction.customId === 'Gamer') {
        selectedUserArray = userArrays[0]
        selectedUserIdArray = userArrays[1]
        otherUserArray = userArrays[2]
        otherUserIdArray = userArrays[3]
        lastUserArray = userArrays[4]
        lastUserIdArray = userArrays[5]
    }
    if (interaction.customId === 'Cringe') {
        selectedUserArray = userArrays[2]
        selectedUserIdArray = userArrays[3]
        otherUserArray = userArrays[0]
        otherUserIdArray = userArrays[1]
        lastUserArray = userArrays[4]
        lastUserIdArray = userArrays[5]
    }
    if (interaction.customId === 'Perhaps') {
        selectedUserArray = userArrays[4]
        selectedUserIdArray = userArrays[5]
        otherUserArray = userArrays[0]
        otherUserIdArray = userArrays[1]
        lastUserArray = userArrays[2]
        lastUserIdArray = userArrays[3]
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
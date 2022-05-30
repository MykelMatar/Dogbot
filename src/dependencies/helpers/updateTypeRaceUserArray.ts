
export async function updateTypeRaceUserArray(interaction, racersArray: string[], racerIdsArray: string[], action: Actions) {

    if (action == 'add'){
        if (!racersArray.includes('> ' + interaction.user.username + '\n')) { // checks if user is in array 1 before adding them
            racersArray.push('> ' + interaction.user.username + '\n')
            racerIdsArray.push(interaction.user.id)
        }
        if (racersArray.length > 1 && racersArray.includes('-')) {  //removes extra dash if a user is in the array
            racersArray.splice(racersArray.indexOf('-'), 1)
        }
    } 
    else if (action == 'remove'){
        if (racersArray.includes('> ' + interaction.user.username + '\n')) { // checks if user is in array 
            racersArray.splice(racersArray.indexOf('> ' + interaction.user.username + '\n'), 1)
            racerIdsArray.splice(racersArray.indexOf(interaction.user.id), 1)
        }
        if (racersArray.length === 0) { // makes sure array 1 is never empty
            racersArray.push('-')
        }
    }
}

export enum Actions {
    add = 'add',
    remove = 'remove'
}
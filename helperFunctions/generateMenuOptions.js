/**
 * refreshes the "Menu Options" in data.JSON and creates a variable-size discord dropdown menu
 * @param  {string} guildName
 * @param  {ApplicationCommandOptionTypes} cmdOptions
 * @param  {int} listSize
 */
 async function generateMenuOptions(guildName, cmdOptions, listSize) {
    console.log('creating menu:')
    let option = [], label = [], value = [];  // arrays to store options and their information

    // retrieve Menu Options from JSON
    console.log('generating options')
    for (let i = 0; i < listSize; i++) {
        label[i] = cmdOptions[i].role.name
        value[i] = cmdOptions[i].value
    }

    // generate discord-readable format for options
    for (let i = 0; i < listSize; i++) {
        option[i] = ({ label: label[i],  value: value[i] })
    }
    console.log('done')
    return [option, label, value];
}

module.exports = generateMenuOptions;
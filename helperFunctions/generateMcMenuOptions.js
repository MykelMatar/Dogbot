const data = require('../data.json');

/**
 * refreshes the "Menu Options" in data.JSON and creates a variable-size discord drowpdown menu
 * @param  {string} guildName
 * @param  {int} listSize
 */
 async function generateMcMenuOptions(guildName, listSize) {
    console.log('creating menu:');
    var option = [], label = [], value = [], description = [];  // arrays to store options and their information
    
    console.log('generating options')
    for (let i = 0; i < listSize; i++) {
        label[i] = Object.keys(data.Guilds[guildName].MCData.serverList)[i]
        description[i] = Object.values(data.Guilds[guildName].MCData.serverList)[i]
        value[i] = `selection${i}`
    }

    // generate discord-readable format for options
    for (let i = 0; i < listSize; i++) {
        option[i] = ({label: label[i], description: description[i], value: value[i]})
    }
    console.log('done')
    return [option, label, value, description];
} 

module.exports = generateMcMenuOptions;

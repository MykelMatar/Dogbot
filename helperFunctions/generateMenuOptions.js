const writeToJson = require('./writeToJson');
const data = require('../data.json');


// functions to generate menu options
/**
 * refreshes the "Menu Options" in data.JSON and creates a variable-size discord drowpdown menu
 * @param  {string} guildName
 * @param  {int} listSize
 */
 async function generateMenuOptions(guildName, cmdOptions, listSize) {
    console.log('creating menu:')
    const menuOptions = data.Guilds[guildName].MenuOptions;
    var option = [], label = [], value = [];  // arrays to store options and their information

    // create and push new entries
    console.log('creating new entries');
    for (let i = 0; i < listSize; i++) {
        var newJson = {
            label: cmdOptions[i].role.name,
            value: cmdOptions[i].value
        }

        menuOptions[i] = newJson;
        writeToJson(data);
    }

    // retrive Menu Options from JSON
    console.log('generating options')
    for (let i = 0; i < listSize; i++) {
        label[i] = JSON.stringify(menuOptions[i].label, null, 2).replace(/[""]/g, '')
        value[i] = JSON.stringify(menuOptions[i].value, null, 2).replace(/[""]/g, '')
    }

    // generate discord-readable format for options
    for (let i = 0; i < listSize; i++) {
        option[i] = ({ label: label[i],  value: value[i] })
    }
    console.log('done')
    return [option, label, value];
}

module.exports = generateMenuOptions;
const writeToJson = require('./writeToJson');
const data = require('../data.json');

/**
 * refreshes the "Menu Options" in data.JSON and creates a variable-size discord drowpdown menu
 * @param  {string} guildName
 * @param  {int} listSize
 */
 async function generateMcMenuOptions(guildName, listSize) {
    console.log('creating menu:');
    const menuOptions = data.Guilds[guildName].MenuOptions;
    var option = [], label = [], value = [], description = [];  // arrays to store options and their information
    
    refreshJsonMenuOptions(guildName, menuOptions, listSize);
   
    // retrive Menu Options from JSON
    console.log('generating options')
    for (let i = 0; i < listSize; i++) {
        label[i] = JSON.stringify(menuOptions[i].label, null, 2).replace(/[""]/g, '')
        description[i] = JSON.stringify(menuOptions[i].description, null, 2).replace(/[""]/g, '')
        value[i] = JSON.stringify(menuOptions[i].value, null, 2).replace(/[""]/g, '')
    }

    // generate discord-readable format for options
    for (let i = 0; i < listSize; i++) {
        option[i] = ({label: label[i], description: description[i], value: value[i]})
    }
    console.log('done')
    return [option, label, value, description];
}

/**
 * refreshes the menu options in the data.json file
 * @param  {string} guildName
 * @param  {string} menuOptions
 * @param  {int} listSize
 */
function refreshJsonMenuOptions(guildName, menuOptions, listSize){
    deleteJsonMenuOptions(guildName, menuOptions);
    generateJsonMenuOptionsServerList(guildName, menuOptions, listSize);
}

/**
 * deletes exisiting menu options in data.json (max size of 10 options)
 * @param  {string} guildName
 * @param  {string} menuOptions
 */
function deleteJsonMenuOptions(guildName, menuOptions){
    console.log('deleting existing entries');
    for (let i = 0; i < 9; i++) {      
        delete menuOptions[i];
        writeToJson(data);
    }
}

/**
 * generates new menu options by referencing exisiting server list and retrieving its information
 * @param  {string} guildName
 * @param  {string} menuOptions
 * @param  {int} listSize
 */
function generateJsonMenuOptionsServerList(guildName, menuOptions, listSize){
    // create and push new entries
    console.log('creating new entries');
    let list = data.Guilds[guildName].MCData.serverList 

     for (let i = 0; i < listSize; i++) {    
         var newJson = {
             label : Object.keys(data.Guilds[guildName].MCData.serverList)[i],
             description : Object.values(data.Guilds[guildName].MCData.serverList)[i],
             value : `selection${i}`
         }
         
         menuOptions[i] = newJson;
         writeToJson(data);
     }
}

module.exports = generateMcMenuOptions;
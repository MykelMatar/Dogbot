const guilds = require("../../schemas/guild-schema");

/**
 * refreshes the "Menu Options" in data.JSON and creates a variable-size discord drowpdown menu
 * @param  {string} guildName
 * @param interaction
 * @param  {int} listSize
 */
 async function generateMcMenuOptions(guildName, interaction, listSize) {
    console.log('creating menu:');
    let option = [], label = [], value = [], description = [];  // arrays to store options and their information
    
    // retrieve server doc and list from mongo
    const currentGuild = await guilds.find({guildId: interaction.guildId})
    let serverList = currentGuild[0].MCServerData.serverList
    
    console.log('generating options')
    for (let i = 0; i < listSize; i++) {
        label[i] = serverList[i].name
        description[i] = serverList[i].ip
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

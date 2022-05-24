import guilds from '../schemas/guild-schema'

export async function generateMCMenuOptions(interaction, guildName, listSize){
    console.log('creating menu:');
    let option = [], label = [], value = [], description = [];  // arrays to store options and their information

    // retrieve server doc and list from mongo
    const currentGuild = await guilds.findOne({guildId: interaction.guildId})
    let serverList = currentGuild.MCServerData.serverList

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
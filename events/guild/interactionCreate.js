var requireDir = require('require-dir');
var dir = requireDir('../../commands');



module.exports = async (client, interaction) => {
    if(!interaction.isCommand()) return

    let guildName = interaction.guild.name.replace(/\s+/g, "");

    const { commandName, options } = interaction 

    if (commandName === 'enlist'){
        await dir.enlistInt.execute(client, interaction, null, guildName)
    }

    if (commandName === 'mc'){
        await interaction.deferReply();
        await dir.mcInteraction.execute(client, interaction, null, guildName)
    }
}
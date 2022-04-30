var requireDir = require('require-dir');
var dir = requireDir('../../commands');



module.exports = async (client, interaction) => {
    if (!interaction.isCommand()) return

    let guildName = interaction.guild.name.replace(/\s+/g, "");

    const { commandName, options } = interaction

    // Begin Slash Command List

    if (commandName === 'addmc') {
        await interaction.deferReply({ ephemeral: true })
        await dir.addmc.execute(client, interaction, guildName)
    }

    if (commandName === 'changemc') {
        await interaction.deferReply({ ephemeral: true })
        await dir.changemc.execute(client, interaction, guildName)
    }

    if (commandName === 'changemcip') {
        await interaction.deferReply({ ephemeral: true })
        await dir.changemcip.execute(client, interaction, guildName)
    }

    if (commandName === 'delmc') {
        await interaction.deferReply({ ephemeral: true })
        await dir.delmc.execute(client, interaction,  guildName)
    }

    if (commandName === 'elp') {
        await dir.elp.execute(client, interaction)
    }

    if (commandName === 'enlist') {
        await dir.enlist.execute(client, interaction, guildName)
    }

    if (commandName === 'listmc') {
        await interaction.deferReply({ ephemeral: true })
        await dir.listmc.execute(client, interaction, guildName)
    }

    if (commandName === 'mc') {
        await interaction.deferReply({ ephemeral: true }); // wait 15s; offline servers take a while to respond.
        await dir.mc.execute(client, interaction, guildName)
    }

    if (commandName === 'renamemc'){
        await interaction.deferReply({ ephemeral: true })
        await dir.renamemc.execute(client, interaction, guildName)
    }

    if (commandName === 'setrole'){
        await interaction.deferReply({ ephemeral: true })
        await dir.setrole.execute(client, interaction, guildName)
    }

}
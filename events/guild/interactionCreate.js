var requireDir = require('require-dir');
var dir = requireDir('../../commands', { recurse: true });



module.exports = async (client, interaction) => {
    if (!interaction.isCommand()) return

    let guildName = interaction.guild.name.replace(/\s+/g, "");
    const { commandName, options } = interaction

    // Slash Command List + execution instructions
    // enlist_user commands
    if (commandName === 'clearrole-autoenlist') {
        await dir.enlist_user['clearrole-autoenlist'].executeq(client, interaction, guildName)
    }

    if (commandName === 'enlist-users') {
        await dir.enlist_user['enlist'].execute(client, interaction, guildName)
    }

    if (commandName === 'setrole-autoenlist') {
        await interaction.deferReply({ ephemeral: true })
        await dir.enlist_user['setrole-autoenlist'].execute(client, interaction, guildName)
    }


    // get_stats commands
    if (commandName === 'get-stats-valorant') {
        if (options._hoistedOptions[2] == undefined) ephemeralSetting = false
        else ephemeralSetting = options._hoistedOptions[2].value
        await interaction.deferReply({ ephemeral: ephemeralSetting })
        await dir.get_stats['valstats'].execute(client, interaction, guildName)
    }


    // help commands
    if (commandName === 'elp') {
        console.log('elp');
        await dir.help['elp'].execute(client, interaction)
    }

    if (commandName === 'suggestion') {
        await interaction.deferReply({ ephemeral: true })
        await dir.help['suggestion'].execute(client, interaction, guildName)
    }


    // mc commands
    if (commandName === 'mc-add-server') {
        await interaction.deferReply({ ephemeral: true })
        await dir.mc['mc-add-server'].execute(client, interaction, guildName)
    }

    if (commandName === 'mc-change-server-ip') {
        await interaction.deferReply({ ephemeral: true })
        await dir.mc['mc-change-server-ip'].execute(client, interaction, guildName)
    }

    if (commandName === 'mc-change-server-name') {
        await interaction.deferReply({ ephemeral: true })
        await dir.mc['mc-change-server-name'].execute(client, interaction, guildName)
    }

    if (commandName === 'mc-change-server') {
        await interaction.deferReply({ ephemeral: true })
        await dir.mc['mc-change-server'].execute(client, interaction, guildName)
    }

    if (commandName === 'mc-delete-server') {
        await interaction.deferReply({ ephemeral: true })
        await dir.mc['mc-delete-server'].execute(client, interaction, guildName)
    }

    if (commandName === 'mc-list-servers') {
        await interaction.deferReply({ ephemeral: true })
        await dir.mc['mc-list-servers'].execute(client, interaction, guildName)
    }

    if (commandName === 'mc-server-status') {
        await interaction.deferReply({ ephemeral: true }); // wait 15s; offline servers take a while to respond.
        await dir.mc['mc-server-status'].execute(client, interaction, guildName)
    }


    // role_selection commands
    if (commandName === 'clearrole-default') {
        await dir.role_selection['clearrole-default'].executeq(client, interaction, guildName)
    }

    if (commandName === 'setrole-default') {
        await interaction.deferReply({ ephemeral: true })
        await dir.role_selection['setrole-default'].execute(client, interaction, guildName)
    }
}
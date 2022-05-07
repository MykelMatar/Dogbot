


module.exports = async (client, interaction) => {
    if (!interaction.isCommand()) return
    
    let commands = client.commands
    let guildName = interaction.guild.name.replace(/\s+/g, "");
    const { commandName, options } = interaction

    // Slash Command List + execution instructions
    // enlist_user commands

    if (commandName === 'clearrole-autoenlist') {
        await commands.get('clearrole-autoenlist').execute(client, interaction, guildName)
    }

    if (commandName === 'enlist-users') {
        await commands.get('enlist-users').execute(client, interaction, guildName)
    }

    if (commandName === 'setrole-autoenlist') {
        await interaction.deferReply({ ephemeral: true })
        await commands.get('setrole-autoenlist').execute(client, interaction, guildName)
    }


    // get_stats commands
    if (commandName === 'get-stats-valorant') {
        if (options._hoistedOptions[2] == undefined) ephemeralSetting = false
        else ephemeralSetting = options._hoistedOptions[2].value
        await interaction.deferReply({ ephemeral: ephemeralSetting })
        await commands.get('get-stats-valorant').execute(client, interaction, guildName)
    }


    // help commands
    if (commandName === 'elp') {
        await commands.get('elp').execute(client, interaction)
    }

    if (commandName === 'suggestion') {
        await interaction.deferReply({ ephemeral: true })
        await commands.get('suggestion').execute(client, interaction, guildName)
    }


    // mc commands
    if (commandName === 'mc-add-server') {
        await interaction.deferReply({ ephemeral: true })
        await commands.get('mc-add-server').execute(client, interaction, guildName)
    }

    if (commandName === 'mc-change-server-ip') {
        await interaction.deferReply({ ephemeral: true })
        await commands.get('mc-change-server-ip').execute(client, interaction, guildName)
    }

    if (commandName === 'mc-change-server-name') {
        await interaction.deferReply({ ephemeral: true })
        await commands.get('mc-change-server-name').execute(client, interaction, guildName)
    }

    if (commandName === 'mc-change-server') {
        await interaction.deferReply({ ephemeral: true })
        await commands.get('mc-change-server').execute(client, interaction, guildName)
    }

    if (commandName === 'mc-delete-server') {
        await interaction.deferReply({ ephemeral: true })
        await commands.get('mc-delete-server').execute(client, interaction, guildName)
    }

    if (commandName === 'mc-list-servers') {
        await interaction.deferReply({ ephemeral: true })
        await commands.get('mc-list-servers').execute(client, interaction, guildName)
    }

    if (commandName === 'mc-server-status') {
        await interaction.deferReply({ ephemeral: true }); // wait 15s; offline servers take a while to respond.
        await commands.get('mc-server-status').execute(client, interaction, guildName)
    }


    // role_selection commands
    if (commandName === 'clearrole-default') {
        await commands.get('clearrole-default').execute(client, interaction, guildName)
    }

    if (commandName === 'role-selection-menu') {
        await interaction.deferReply()
        await commands.get('role-selection-menu').execute(client, interaction, guildName)
    }

    if (commandName === 'set-welcome-channel') {
        await interaction.deferReply({ ephemeral: true })
        await commands.get('set-welcome-channel').execute(client, interaction, guildName)
    }
    
    if (commandName === 'setrole-default') {
        await interaction.deferReply({ ephemeral: true })
        await commands.get('setrole-default').execute(client, interaction, guildName)
    }

    // const used = process.memoryUsage().heapUsed / 1.048e6;
    // console.log(`cmd used ${used} MB of RAM`);
}
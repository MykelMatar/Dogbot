const DiscordJS = require('discord.js');

module.exports = (client) => {
    client.user.setActivity('try /elp');
    console.log('Dogbot ready');

    // slash commands
    const guildId = '351618107384528897'
    const guild = client.guilds.cache.get(guildId)
    let commands

    if (guild) {
        commands = guild.commands
    } else {
        commands = client.application?.commands
    }

    commands?.create({
        name: 'addmc',
        description: 'Adds a new IP to the server list',
        options: [
            {
                name: 'ip',
                description: 'IP of your server. MAKE SURE THE SERVER IS ONLINE',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'name',
                description: 'name of your server. Can be changed later using changemc',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    });

    commands?.create({
        name: 'changemc',
        description: 'Changes Server that is being tracked by mc'
    });

    commands?.create({
        name: 'changemcip',
        description: 'Changes IP of existing server',
        options: [
            {
                name: 'ip',
                description: 'IP of your server. MAKE SURE THE SERVER IS ONLINE',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    });

    commands?.create({
        name: 'delmc',
        description: 'Removes server from server list'
    });

    commands?.create({
        name: 'elp',
        description: 'lists all commands and relevant information'
    });

    commands?.create({
        name: 'enlist',
        description: 'creates interaction to enlist other users for event/group'
    });

    commands?.create({
        name: 'listmc',
        description: 'Lists registered mc servers'
    });

    commands?.create({
        name: 'mc',
        description: 'Renames existing mc server'
    });

    commands?.create({
        name: 'renamemc',
        description: 'Retrieves MC server status',
        options: [
            {
                name: 'newname',
                description: 'New name of your server.',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    });

    commands?.create({
        name: 'setrole',
        description: 'changes the role used to enlist (for automated enlisting)'
    });

}


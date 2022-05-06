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

    // slash command creation
    // enlist_user 
    commands?.create({
        name: 'clearrole-autoenlist',
        description: 'Clears role used to automate /enlist'
    });

    commands?.create({
        name: 'enlist-users',
        description: 'creates interaction to enlist other users for event/group'
    });

    commands?.create({
        name: 'setrole-autoenlist',
        description: 'changes the role used to enlist (for automated enlisting)',
        options: [
            {
                name: 'role',
                description: 'role to be auto-detected',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.ROLE
            },
        ]
    });


    // get_stats
    commands?.create({
        name: 'get-stats-valorant',
        description: 'retrieves valorant stats from tracker.gg',
        options: [
            {
                name: 'username',
                description: 'username, CASE-SENSITIVE',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'tag',
                description: 'string after #, CASE-SENSITIVE',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'hide',
                description: 'optional setting: stats are only displayed for you. Leave blank to make it public',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.BOOLEAN
            }
        ]
    });


    //help
    commands?.create({
        name: 'elp',
        description: 'lists all commands and relevant information'
    });

    commands?.create({
        name: 'suggestion',
        description: 'allows users to make suggestions for the bot',
        options: [
            {
                name: 'suggestion',
                description: 'what would you like to see dogbot do?',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            },
        ]
    });


    // mc
    commands?.create({
        name: 'mc-add-server',
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
        name: 'mc-change-server-ip',
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
        name: 'mc-change-server-name',
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
        name: 'mc-change-server',
        description: 'Changes Server that is being tracked by mc'
    });

    commands?.create({
        name: 'mc-delete-server',
        description: 'Removes server from server list'
    });

    commands?.create({
        name: 'mc-list-servers',
        description: 'Lists registered mc servers'
    });

    commands?.create({
        name: 'mc-server-status',
        description: 'Renames existing mc server'
    });


    //role_selection
    commands?.create({
        name: 'clearrole-default',
        description: 'removes default role given to new users'
    });

    commands?.create({
        name: 'setrole-default',
        description: 'changes the role given to new users',
        options: [
            {
                name: 'role',
                description: 'role to be auto-detected',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.ROLE
            },
        ]
    });

}

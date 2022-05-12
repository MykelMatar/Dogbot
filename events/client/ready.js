const DiscordJS = require('discord.js');


module.exports = (client) => {
    client.user.setActivity('try /elp');
    console.log('Dogbot ready');

    // slash commands
    const guildId = '351618107384528897'
    const guild = client.guilds.cache.get(guildId)
    let commands

    // guild.commands.set([]) // resets guild commands
    // client.application.commands.set([]) // reset application commands

    if (guild) {
        commands = guild.commands
    } else {
        // commands = client.application?.commands // register slash commands globally
    }

    // slash command creation
    
    // creation commands
    commands.create({
        name: 'say',
        description: 'use Dogbot to say something',
        options: [
            {
                name: 'message',
                description: 'what you want dogbot to say',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    })
    
    // enlist_user commands
    commands.create({
        name: 'clearrole-autoenlist',
        description: 'Clears role used to automate /enlist-users'
    });

    commands.create({
        name: 'enlist-users',
        description: 'creates interaction to enlist other users for event/group'
    });

    commands.create({
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

    
    // games
    commands.create({
        name: 'tictactoe',
        description: 'changes the role used to enlist (for automated enlisting)',
        options: [
            {
                name: 'opponent',
                description: 'user to challenge. Leave blank to challenge Dogbot',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.USER
            },
        ]
    });

    // get_stats commands
    commands.create({
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


    //help commands
    commands.create({
        name: 'elp',
        description: 'lists all commands and relevant information'
    });

    commands.create({
        name: 'server-stats',
        description: 'displays server info'
    });

    commands.create({
        name: 'suggestion',
        description: 'allows users to make suggestions about dogbot',
        options: [
            {
                name: 'suggestion',
                description: 'what would you like to see dogbot do?',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            },
        ]
    });


    // mc commands
    commands.create({
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

    commands.create({
        name: 'mc-change-server-ip',
        description: 'Changes the IP of an existing server',
        options: [
            {
                name: 'new-ip',
                description: 'New IP of your server. MAKE SURE THE SERVER IS ONLINE',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    });

    commands.create({
        name: 'mc-change-server-name',
        description: 'Changes the name of an existing server',
        options: [
            {
                name: 'newname',
                description: 'New name of your server.',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    });

    commands.create({
        name: 'mc-change-server',
        description: 'Changes Server that is being tracked by mc-server-status'
    });

    commands.create({
        name: 'mc-delete-server',
        description: 'Removes server from server list'
    });

    commands.create({
        name: 'mc-list-servers',
        description: 'Lists registered minecraft servers'
    });

    commands.create({
        name: 'mc-server-status',
        description: 'Gets status of selected minecraft server'
    });


    //role_selection commands
    commands.create({
        name: 'role-selection-menu',
        description: 'creates dropdown menu for users to select roles. Add up to 10 roles.',
        options: [
            {
                name: 'role',
                description: 'role to added to menu',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.ROLE
            },
            {
                name: 'roleopt1',
                description: 'role to added to menu',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.ROLE
            },
            {
                name: 'roleopt2',
                description: 'role to added to menu',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.ROLE
            },
            {
                name: 'roleopt3',
                description: 'role to added to menu',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.ROLE
            },
            {
                name: 'roleopt4',
                description: 'role to added to menu',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.ROLE
            },
            {
                name: 'roleopt5',
                description: 'role to added to menu',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.ROLE
            },
            {
                name: 'roleopt6',
                description: 'role to added to menu',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.ROLE
            },
            {
                name: 'roleopt7',
                description: 'role to added to menu',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.ROLE
            },
            {
                name: 'roleopt8',
                description: 'role to added to menu',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.ROLE
            },
            {
                name: 'roleopt9',
                description: 'role to added to menu',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.ROLE
            },
        ]
    });

    commands.create({
        name: 'clearrole-default',
        description: 'removes default role given to new users.'
    });

    commands.create({
        name: 'set-welcome-channel',
        description: 'sets the welcome channel of the server',
        options: [
            {
                name: 'channel',
                description: 'welcome channel',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.CHANNEL
            },
        ]
    });

    commands.create({
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

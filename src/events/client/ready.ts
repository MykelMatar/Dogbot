import DiscordJS, {Client} from "discord.js";
import mongoose from "mongoose";

export async function ready(client: Client) {
    await mongoose.connect(process.env.MONGO_URI, {keepAlive: true, dbName: 'Dogbot'})
    client.user.setActivity('/elp');
    console.log('Dogbot ready')

    // slash commands
    const guildId = '351618107384528897' // crayon
    const guild = client.guilds.cache.get(guildId)
    // const guildId2 = '715122900021149776' // bot testing
    // const guild2 = client.guilds.cache.get(guildId2)
    let commands
    // await guild.commands.set([]) // resets guild commands
    // await client.application.commands.set([]) // reset application commands

    if (guild) {
        commands = guild.commands
        // commands = guild2.commands
    } else {
        // commands = client.application?.commands // register slash commands globally
    }

    // slash command creation

    // test
    commands?.create({
        name: 'simleave',
        description: 'simulates user leaving'
    });
    commands?.create({
        name: 'simjoin',
        description: 'simulates user joining'
    });

    // enlist-users commands
    commands?.create({
        name: 'clearrole-autoenlist',
        description: 'Clears role used to automate /enlist-users'
    });

    commands?.create({
        name: 'enlist-users',
        description: 'creates interaction to enlist other users for event/group'
    });
    commands?.create({
        name: 'enlist-stats',
        description: 'shows how many times a user enlisted and rejected the Enlist prompt',
        options: [
            {
                name: 'user',
                description: 'user whose stats you want to show. leave blank to display your own',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.USER
            },
            {
                name: 'hide',
                description: 'whether to hide the message from everyone else. True by default',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.BOOLEAN
            }
        ]
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
    
    // get-stats commands
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
                description: 'whether to hide the message from everyone else. True by default',
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
    
    // minecraft commands
    commands?.create({
        name: 'mc-add-server',
        description: 'test2 typescript commands',
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
    })

    commands?.create({
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

    commands?.create({
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

    commands?.create({
        name: 'mc-change-server',
        description: 'Changes Server that is being tracked by mc-server-status'
    });

    commands?.create({
        name: 'mc-delete-server',
        description: 'Removes server from server list'
    });

    commands?.create({
        name: 'mc-list-servers',
        description: 'Lists registered minecraft servers'
    });

    commands?.create({
        name: 'mc-server-status',
        description: 'Gets status of selected minecraft server',
        options: [
            {
                name: 'username',
                description: 'check to see if a certain user in online.',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'hide',
                description: 'Whether to hide the message from everyone else. True by default.',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.BOOLEAN
            }
        ]
    });


}


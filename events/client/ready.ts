import DiscordJS, {Client} from "discord.js";
import mongoose from "mongoose";

export async function ready(client: Client) {
    await mongoose.connect(process.env.MONGO_URI, {keepAlive: true, dbName: 'Dogbot'})
    client.user.setActivity('try /elp');
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
                description: 'optional setting: stats are only displayed for you. Leave blank to make it public',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.BOOLEAN
            }
        ]
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
                description: 'whether to hide message or not (true by default).',
                required: false,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.BOOLEAN
            }
        ]
    });


}


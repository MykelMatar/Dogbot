
module.exports = (client) =>{
    client.user.setActivity('getting !elp');
    console.log('Dogbot ready');

    // slash commands
    const guildId = "351618107384528897"
    const guild = client.guilds.cache.get(guildId)
    let commands
    if ( guild) {
        commands = guild.commands
    } else {
        commands = client.application?.commands
    }

    commands?.create({
        name: 'enlist',
        description: 'creates interaction to enlist other users for event/group'
    });

    commands?.create({
        name: 'mc',
        description: "Retrieves MC server status"
    });


}


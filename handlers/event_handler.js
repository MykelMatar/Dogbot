const fs = require('fs');

module.exports = (client) => {
    const loadDir = (dirs) => { 
        const eventFiles = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js'));

        for(file of eventFiles){
            const event = require(`../events/${dirs}/${file}`);
            const eventName = file.split('.')[0];
            client.on(eventName, event.bind(null, client));
        }
    }

    ['client', 'guild'].forEach(e => loadDir(e));
}
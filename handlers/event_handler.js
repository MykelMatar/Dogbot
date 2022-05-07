const fs = require('fs');

module.exports = (client) => {
    const loadDir = (dir) => {
        const eventFiles = fs.readdirSync(`./events/${dir}`).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const event = require(`../events/${dir}/${file}`);
            const eventName = file.split('.')[0];
            client.on(eventName, event.bind(null, client));
        }
    }

    ['client', 'guild', 'interaction'].forEach(e => loadDir(e));
}
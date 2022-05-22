const requireDir = require('require-dir');
const dir = requireDir('../events', {extension: '.js', recurse: true});

module.exports = (client) => {
    const eventFiles = dir;
    const eventFolders = ['client', 'guild', 'interaction']

    for (let i = 0; i < eventFolders.length; i++) {
        for (const file in eventFiles[`${eventFolders[i]}`]) {
            const event = require(`../events/${eventFolders[i]}/${file}`);
            const eventName = file.split('.')[0];
            client.on(eventName, event.bind(null, client));
        }
    }
    console.log(client.events)
}
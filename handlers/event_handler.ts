import {Client} from "discord.js";
import requireDir from 'require-dir'
const dir = requireDir('../events', {extension: '.js', recurse: true});

export default (client: Client) => {
    const eventFiles = dir;
    const eventFolders = ['client', 'guild', 'interaction']

    eventFolders.forEach(event => {
        for (const file in eventFiles[`${event}`]) {
            event = require(`../events/${event}/${file}`);
            const eventName = file.split('.')[0];
            // @ts-ignore
            client.on(eventName, event.default.bind(null, client));
        }
    })
}

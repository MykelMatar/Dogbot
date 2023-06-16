import {Client} from "discord.js";
import {getFiles} from "../dependencies/helpers/otherHelpers/getFiles";

export default (client: Client) => {
    const eventFiles = getFiles('./src/events', '.ts')

    for (const file of eventFiles) {
        let events = require(`../.${file}`)
        for (let event in events) {
            const eventName = events[event].name
            client.on(eventName, events[event].bind(null, client));
        }
    }
}

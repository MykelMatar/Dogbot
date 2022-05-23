import {Client} from "discord.js";
import {getFiles} from "../helpers/get-files";

export default (client: Client) => {
    const eventFiles = getFiles('./events', '.ts')
    for (const eventFile of eventFiles){
        let events = require(`.${eventFile}`)
        for (let event in events) {
            const eventName = events[event].name
            // // @ts-ignore
            client.on(eventName, events[event].bind(null, client));
        }
    }
}

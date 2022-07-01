import {Client} from "discord.js";
import {getFiles} from "../dependencies/helpers/get-files";

export default (client: Client) => {
    const eventFiles = getFiles('./src/events', '.ts')
     
    for (const eventFile of eventFiles){
        let events = require(`../.${eventFile}`)
        for (let event in events) {
            const eventName = events[event].name
            client.on(eventName, events[event].bind(null, client));
        }
    }
}

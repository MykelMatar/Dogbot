import {ActivityType} from "discord.js";
import mongoose from "mongoose";
import {newClient} from "../../dependencies/myTypes";
import {log} from "../../dependencies/logger";

export async function ready(client: newClient) {
    await mongoose.connect(process.env.MONGO_URI, {keepAlive: true, dbName: 'Dogbot'})
    
    client.user.setActivity('with the bois', {type: ActivityType.Playing});
    log.info('Dogbot Ready')
}


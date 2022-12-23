import {ActivityType} from "discord.js";
import mongoose from "mongoose";
import {NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";

export async function ready(client: NewClient) {
    await mongoose.connect(process.env.MONGO_URI, {keepAlive: true, dbName: 'Dogbot'})

    client.user.setActivity('with the bois', {type: ActivityType.Playing});
    if (client.isTestBot) {
        log.info('Test Bot Ready')
    } else {
        log.info('Dogbot Ready')
    }
}


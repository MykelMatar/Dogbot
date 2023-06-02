import {ActivityType} from "discord.js";
import mongoose from "mongoose";
import {NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";

export async function ready(client: NewClient) {
    await mongoose.connect(process.env.MONGO_URI, {keepAlive: true, dbName: 'Dogbot'})

    // change activity every 10s
    let activities: string[] = ['Fortnite no build', 'Warzone no build', 'with ur mom', 'with ur dad', 'with the bois']
    setInterval(function() {
        let activityType: ActivityType
        let index = Math.floor(Math.random() * (activities.length - 1))
        if (index == 0 || index == 1) {
            activityType = ActivityType.Competing
        } else {
            activityType = ActivityType.Playing
        }
        client.user.setActivity(activities[index], {type: activityType});
    }, 10000)
    
    if (client.isTestBot) {
        log.info('Test Bot Ready')
    } else {
        log.info('Dogbot Ready')
    }
}


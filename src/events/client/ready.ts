import { ActivityType } from "discord.js";
import mongoose, { Error } from "mongoose";
import log from "../../dependencies/constants/logger";
import { Activity, CustomClient } from "../../dependencies/myTypes";

export async function ready(client: CustomClient) {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'Dogbot'})
        .then(() => {
            log.info('Connected to Mongo')
        }).catch(e => {
            return new Error(e)
        })

    // change activity every 10s
    const activities: Activity[] = [
        {activity: 'Fortnite no build', type: ActivityType.Competing},
        {activity: 'Warzone no build', type: ActivityType.Competing},
        {activity: 'with the bois', type: ActivityType.Playing},
        {activity: 'the voices', type: ActivityType.Listening},
        {activity: 'Cars 3', type: ActivityType.Watching},
        {activity: 'fetch', type: ActivityType.Playing},
    ]

    let lastActivity: Activity | null = null;

    setInterval(function() {
        let index = Math.floor(Math.random() * (activities.length))

        while (activities.length > 1 && activities[index] === lastActivity) {
            index = Math.floor(Math.random() * activities.length);
        }

        lastActivity = activities[index];
        client.user.setActivity(activities[index].activity, {type: activities[index].type});
    }, 10_000)

    if (client.isTestBot) {
        log.info('Test Bot Ready')
    } else {
        log.info('Dogbot Ready')
    }
}


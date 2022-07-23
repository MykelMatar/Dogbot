import {ActivityType} from "discord.js";
import {newClient} from "../../dependencies/myTypes";
import mongoose from "mongoose";

export async function ready(client: newClient) {
    await mongoose.connect(process.env.MONGO_URI, {keepAlive: true, dbName: 'Dogbot'})
    
    client.user.setActivity('with the bois', {type: ActivityType.Playing});
    console.log('Dogbot ready')
}


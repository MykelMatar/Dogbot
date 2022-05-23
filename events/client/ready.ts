import {Client} from "discord.js";
import mongoose from "mongoose";

export default async (client: Client) => {
    await mongoose.connect(process.env.MONGO_URI,{keepAlive: true, dbName: 'Dogbot'})
    client.user.setActivity('try /elp');
    console.log('Dogbot ready')

    // slash commands
    const guildId = '351618107384528897' // crayon
    // const guildId2 = '715122900021149776' // bot testing
    const guild = client.guilds.cache.get(guildId)
    // const guild2 = client.guilds.cache.get(guildId2)
    let commands
    // await guild.commands.set([]) // resets guild commands
    // await client.application.commands.set([]) // reset application commands

    if (guild) {
        commands = guild.commands
        // commands = guild2.commands
    } else {
        // commands = client.application?.commands // register slash commands globally
    }
    
    // slash command creation

    // test
    commands?.create({
        name: 'test2',
        description: 'test2 typescript commands',
    })
}
import {Client, Guild} from "discord.js";
import guilds from '../../schemas/guild-schema'

export async function guildDelete (client: Client, guild: Guild) {
    console.log(`Dogbot added to ${guild.name}`);

    // delete user data from mongo
    console.log('removing server data...')
    guilds.findOne({guildId: guild.id})
        .deleteOne()
        .catch(err => console.log(err))
    console.log('done!')
}
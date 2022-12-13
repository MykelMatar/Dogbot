import {Guild} from "discord.js";
import guilds from '../../dependencies/schemas/guild-schema'
import log from "../../dependencies/logger";
import {NewClient} from "../../dependencies/myTypes";

export async function guildDelete(client: NewClient, guild: Guild) {
    log.info(`Dogbot added to ${guild.name}`);

    // delete user data from mongo
    log.info('removing server data...')
    guilds.findOne({guildId: guild.id})
        .deleteOne()
        .catch(err => log.info(err))
    log.info('done!')
}
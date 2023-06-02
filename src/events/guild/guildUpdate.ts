import guilds from '../../dependencies/schemas/guild-schema'
import log from "../../dependencies/constants/logger";
import {NewClient} from "../../dependencies/myTypes";
import {Guild} from "discord.js";

export async function guildUpdate(client: NewClient, oldGuild: Guild, newGuild: Guild) {
    log.info(`Guild ${oldGuild.id} has been changed`);
    guilds.findOneAndUpdate(
        {guildId: oldGuild.id},
        {$set: {guildId: newGuild.id}}, // not sure if id can ever change, but just in case
        {$set: {guild: newGuild.name}}
    ).catch(err => log.info(err))
}
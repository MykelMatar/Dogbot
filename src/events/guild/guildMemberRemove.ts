import guilds from '../../dependencies/schemas/guild-schema'
import log from "../../dependencies/logger";
import {NewClient} from "../../dependencies/myTypes";
import {GuildMember} from "discord.js";

export async function guildMemberRemove(client: NewClient, guildMember: GuildMember) {
    log.info(`${guildMember.user.username} has left ${guildMember.guild.name}`);
    guilds.findOneAndUpdate(
        {guildId: guildMember.guild.id},
        {$pull: {UserData: {id: guildMember.user.id}}}
    ).catch(err => log.info(err))
}
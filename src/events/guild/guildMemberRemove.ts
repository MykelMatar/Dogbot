import guilds from '../../dependencies/schemas/guild-schema'
import log from "../../dependencies/logger";

export async function guildMemberRemove (client, guildMember) {
    log.info(`${guildMember.user.username} has left ${guildMember.guild.name}`);

    // delete user data from mongo
    guilds.findOneAndUpdate(
        {guildId: guildMember.guild.id},
        {$pull: { UserData: {id: guildMember.user.id}}}
    ).catch(err => log.info(err))
}
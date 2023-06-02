import Guild from '../../dependencies/schemas/guild-schema'
import log from "../../dependencies/constants/logger";
import {NewClient} from "../../dependencies/myTypes";
import {GuildMember} from "discord.js";

export async function guildMemberUpdate(client: NewClient, oldMember: GuildMember, newMember: GuildMember) {
    log.info(`Guild member info changed has been changed`);
    if (oldMember.user.username != newMember.user.username) {
        const filter = {guildId: oldMember.guild.id, 'userData.id': oldMember.user.id};
        const update = {$set: {'userData.$.username': newMember.user.username}};

        await Guild.findOneAndUpdate(filter, update, {new: true});
        log.info(`Updated username`)
    }
    if (oldMember.user.id != newMember.user.id) {
        const filter = {guildId: oldMember.guild.id, 'userData.id': oldMember.user.id};
        const update = {$set: {'userData.$.id': newMember.user.id}};

        await Guild.findOneAndUpdate(filter, update, {new: true});
        log.info(`Updated user id`)
    }
}
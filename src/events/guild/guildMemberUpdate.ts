import Guild from '../../dependencies/schemas/guild-schema'
import {CustomClient} from "../../dependencies/myTypes";
import {GuildMember} from "discord.js";

export async function guildMemberUpdate(client: CustomClient, oldMember: GuildMember, newMember: GuildMember) {
    if (oldMember.user.username != newMember.user.username) {
        const filter = {guildId: oldMember.guild.id, 'userData.id': oldMember.user.id};
        const update = {$set: {'userData.$.username': newMember.user.username}};

        await Guild.findOneAndUpdate(filter, update, {new: true});
    }
    if (oldMember.user.id != newMember.user.id) {
        const filter = {guildId: oldMember.guild.id, 'userData.id': oldMember.user.id};
        const update = {$set: {'userData.$.id': newMember.user.id}};

        await Guild.findOneAndUpdate(filter, update, {new: true});
    }
}
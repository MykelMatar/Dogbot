import guilds from '../../dependencies/schemas/guild-schema'

export async function guildMemberRemove (client, guildMember) {
    console.log(`${guildMember.user.username} has left ${guildMember.guild.name}`);

    // delete user data from mongo
    guilds.findOneAndUpdate(
        {guildId: guildMember.guild.id},
        {$pull: { UserData: {id: guildMember.user.id}}}
    ).catch(err => console.log(err))
}
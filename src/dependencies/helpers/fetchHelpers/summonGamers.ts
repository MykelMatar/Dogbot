import {CommandInteraction, userMention} from "discord.js";
import {FetchUserData} from "../../myTypes";


export default async function(interaction: CommandInteraction, fetchUserData: FetchUserData, minGamers: number) {
    if (fetchUserData.acceptedUserIds.length == 0) return

    const formatUserMentions = (userIds: string[]): string[] => {
        return userIds.map(id => userMention(id));
    };

    const acceptedUsers = formatUserMentions(fetchUserData.acceptedUserIds);
    const potentialUsers = formatUserMentions(fetchUserData.potentialUserIds);

    let content: string;

    if (fetchUserData.acceptedUserIds.length == 1 && minGamers !== 1) {
        content = `${acceptedUsers.join(',')} has no friends, everyone point and laugh)`;
    } else if (fetchUserData.acceptedUserIds.length + fetchUserData.potentialUserIds.length >= minGamers && fetchUserData.potentialUserIds.length !== 0) {
        content = `${acceptedUsers.join(',')} : Gamer Time is upon us (**${minGamers}** gamers available if ${potentialUsers.join(',')} play)`;
    } else if (fetchUserData.acceptedUserIds.length >= minGamers) {
        content = `${acceptedUsers.join(',')} : Gamer Time is upon us`;
    } else {
        content = `${acceptedUsers.join(',')} : Insufficient Gamers`;
    }

    await interaction.channel.send({content});
}
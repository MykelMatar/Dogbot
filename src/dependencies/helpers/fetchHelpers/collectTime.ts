import {ButtonInteraction, CommandInteraction, ComponentType, GuildMember} from "discord.js";
import {FetchUserData} from "../../myTypes";
import updateFetchEmbed from "./updateFetchEmbed";


export default async function(interaction: CommandInteraction, buttonInteraction: ButtonInteraction, fetchUserData: FetchUserData, embed, enlistPrompt, customIds, pendingResponse) {
    const timeCollector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.SelectMenu,
        time: 60000,
        max: 1,
        filter: (i) =>
            i.customId === 'time' &&
            i.user.id === buttonInteraction.member.user.id,
    });

    timeCollector.on('collect', async timeInteraction => {
        const member = timeInteraction.member as GuildMember;
        const username = member.displayName

        if (!timeInteraction.values[0]) { // idk why this would happen, but just in case
            fetchUserData.userAvailabilityMap.set(timeInteraction.user.id, 'Not Sure')
            fetchUserData.potentialUsers.push(`> ${username} ~'Not Sure'\n`)
            fetchUserData.potentialUserIds.push(timeInteraction.user.id)
        } else {
            fetchUserData.userAvailabilityMap.set(timeInteraction.user.id, timeInteraction.values[0])
            fetchUserData.potentialUsers.push(`> ${username} ~${timeInteraction.values[0]}\n`)
            fetchUserData.potentialUserIds.push(timeInteraction.user.id)
        }
        await buttonInteraction.deleteReply()
        await updateFetchEmbed(buttonInteraction, embed, fetchUserData, enlistPrompt, customIds)
        pendingResponse.splice(pendingResponse.indexOf(buttonInteraction.user.id), 1)

    });
}
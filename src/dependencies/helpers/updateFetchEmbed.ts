import {FetchUserData} from "../myTypes";
import {ButtonInteraction, EmbedBuilder, GuildMember, Message} from "discord.js";

/**
 * updates the arrays used to display names in the fetch prompt. Also updates the ID arrays used
 * to update info in MongoDB
 *
 * @param interaction button interaction
 * @param embed embed in the enlistPrompt message
 * @param enlistUserData object that stores all the user info arrays
 * @param enlistPrompt message containing embed and buttons
 */

export async function updateFetchEmbed(interaction: ButtonInteraction, embed: EmbedBuilder, enlistUserData: FetchUserData, enlistPrompt: Message) {
    const {
        enlistedUsers,
        enlistedUserIds,
        rejectedUsers,
        rejectedUserIds,
        potentialUsers,
        potentialUserIds,
        userAvailabilityMap
    } = enlistUserData

    const member = interaction.member as GuildMember;
    const userId = interaction.user.id

    let selectedUserArray: string[],
        selectedUserIdArray: string[],
        secondUserArray: string[],
        secondUserIdArray: string[],
        thirdUserArray: string[],
        thirdUserIdArray: string[]
    let perhapsFlag: boolean
    const userString: string = `> ${member.displayName}\n`
    const userTime: string | undefined = userAvailabilityMap.get(userId)
    const potentialUserString: string = `> ${member.displayName} ~${userTime}\n`

    if (interaction.customId === 'Gamer') {
        perhapsFlag = false
        selectedUserArray = enlistedUsers
        selectedUserIdArray = enlistedUserIds
        secondUserArray = rejectedUsers
        secondUserIdArray = rejectedUserIds
        thirdUserArray = potentialUsers
        thirdUserIdArray = potentialUserIds
    } else if (interaction.customId === 'Cringe') {
        perhapsFlag = false
        selectedUserArray = rejectedUsers
        selectedUserIdArray = rejectedUserIds
        secondUserArray = enlistedUsers
        secondUserIdArray = enlistedUserIds
        thirdUserArray = potentialUsers
        thirdUserIdArray = potentialUserIds
    } else if (interaction.customId === 'Perhaps') {
        perhapsFlag = true
        selectedUserArray = potentialUsers
        selectedUserIdArray = potentialUserIds
        secondUserArray = enlistedUsers
        secondUserIdArray = enlistedUserIds
        thirdUserArray = rejectedUsers
        thirdUserIdArray = rejectedUserIds
    } else return

    // const charLeft =
    //     embedLimits.totalCharLimit -
    //     (
    //         embed.data.description.length +
    //         embed.data.title.length +
    //         embed.data.footer.text.length +
    //         embed.data.fields[0].name.length +
    //         embed.data.fields[0].value.length +
    //         embed.data.fields[1].name.length +
    //         embed.data.fields[1].value.length
    //     );
    //
    // const charLimit = (charLeft < embedLimits.fields.value) ? (charLeft / 2) - 32 : (embedLimits.fields.value / 2) - 32
    // let isExceedingCharLimit = isExceedingCharacterLimit(selectedUserArray, charLimit)

    if (!perhapsFlag) {
        if (!selectedUserIdArray.includes(userId)) {
            selectedUserArray.push(userString)
            selectedUserIdArray.push(userId)
        }
        if (thirdUserIdArray.includes(userId)) {
            thirdUserArray.splice(thirdUserArray.indexOf(potentialUserString), 1)
            thirdUserIdArray.splice(thirdUserIdArray.indexOf(userId), 1)
            if (userTime) {
                userAvailabilityMap.delete(userId)
            }
        }
    }

    if (selectedUserArray.length === 0) {
        selectedUserArray.push('-')
    } else if (selectedUserArray.includes('-')) {
        selectedUserArray.splice(selectedUserArray.indexOf('-'), 1);
    }
    if (secondUserIdArray.includes(userId)) {
        secondUserArray.splice(secondUserArray.indexOf(userString), 1)
        secondUserIdArray.splice(secondUserIdArray.indexOf(userId), 1)
    }
    if (thirdUserIdArray.includes(userId)) {
        thirdUserArray.splice(thirdUserArray.indexOf(potentialUserString), 1)
        thirdUserIdArray.splice(thirdUserArray.indexOf(userId), 1)
    }
    if (secondUserArray.length === 0) {
        secondUserArray.push('-')
    }
    if (thirdUserArray.length === 0) {
        thirdUserArray.push('-')
    }

    embed.data.fields[0].value = enlistedUsers.join('');
    embed.data.fields[1].value = rejectedUsers.join('');
    embed.data.fields[2].value = potentialUsers.join('');

    await enlistPrompt.edit({embeds: [embed]});
}
import {CommandInteraction} from "discord.js";
import log from "../logger";

export const promptResponse = async (interaction: CommandInteraction, request: string, requestFailMessage: string): Promise<any> => {
    await interaction.editReply(request)
    let filter = m => m.author.id === interaction.member.user.id

    return interaction.channel.awaitMessages({filter, max: 1, time: 20000, errors: ['time']})
        .then(collected => {
            let response = collected.first().content;
            if (response !== null) {
                log.info(`mc-add-server user interaction response: ${response}`);
                return response;
            }
        })
        .catch(() => {
            log.error(requestFailMessage)
            return interaction.editReply(requestFailMessage)
        })
}
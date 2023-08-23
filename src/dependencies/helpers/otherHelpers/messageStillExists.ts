import {DiscordAPIError, Message} from "discord.js";
import log from "../../constants/logger";
import {removeTerminationListener} from "./terminationListener";

export default async function(message: Message, terminateBound?): Promise<boolean> {
    try {
        await message.channel.messages.fetch(message.id)
        return true
    } catch (error) {
        if (error instanceof DiscordAPIError) {
            log.error(`DiscordAPI Error: ${error.message}. Aborting command (message was likely deleted)`)
        } else {
            log.error(error)
        }
        if (terminateBound) removeTerminationListener(terminateBound);
        return false
    }
}
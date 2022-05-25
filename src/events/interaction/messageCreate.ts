import {Message} from "discord.js";
import {autoDetectRole} from "../../dependencies/helpers/autoDetectRole";

export async function messageCreate (client, message: Message) {
    await autoDetectRole(client, message)
}
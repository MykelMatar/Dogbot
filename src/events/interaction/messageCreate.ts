import {Message} from "discord.js";
import {autoDetectRole} from "../../dependencies/helpers/autoDetectRole";
import {newClient} from "../../dependencies/myTypes";

export async function messageCreate (client: newClient, message: Message) {
    await autoDetectRole(client, message)
}
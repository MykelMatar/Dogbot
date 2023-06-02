import {APISelectMenuOption, CommandInteraction} from "discord.js";
import {MinecraftServer} from "../myTypes";

/**
 * Generates interaction menu options for minecraft commands
 *
 * @param interaction
 * @param serverList
 */
export async function McMenuOptionGenerator(interaction: CommandInteraction, serverList: MinecraftServer[]): Promise<APISelectMenuOption[]> {
    let optionsArray: APISelectMenuOption[] = []
    const listSize = serverList.length

    for (let i = 0; i < listSize; i++) {
        optionsArray.push({
            label: serverList[i].name,
            description: serverList[i].ip,
            value: serverList[i].ip, // use server ip as value to make finding the server easier
        })
    }

    return optionsArray
}
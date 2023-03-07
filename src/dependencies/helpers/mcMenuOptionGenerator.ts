import guilds from '../schemas/guild-schema'
import log from "../logger";
import {APISelectMenuOption, CommandInteraction} from "discord.js";
import {DiscordMenuGeneratorReturnValues, DiscordMenuOption} from "../myTypes";

/**
 * Generates interaction menu options for minecraft commands
 *
 * @param interaction
 * @param guildName
 * @param listSize
 */
export async function McMenuOptionGenerator(interaction: CommandInteraction, guildName: string, listSize: number): Promise<DiscordMenuGeneratorReturnValues> {
    let optionsArray: APISelectMenuOption[] = []
    let options: DiscordMenuOption = {
        label: [],
        value: [],
        description: [],
    };

    log.info('retrieving server list...')
    const currentGuild = await guilds.findOne({guildId: interaction.guildId})
    let serverList = currentGuild.MCServerData.serverList

    log.info('generating menu options...')
    for (let i = 0; i < listSize; i++) {
        options.label.push(serverList[i].name)
        options.description.push(serverList[i].ip)
        options.value.push(serverList[i].ip)
        optionsArray.push({
            label: serverList[i].name,
            description: serverList[i].ip,
            value: serverList[i].ip, // use server ip as value to make finding the server easier
        })
    }

    log.info('done')
    return {
        optionsArray: optionsArray,
        options: options,
    };
}
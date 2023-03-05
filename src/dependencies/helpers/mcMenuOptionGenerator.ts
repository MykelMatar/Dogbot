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
        options.value.push(`selection${i}`)
        optionsArray.push({
            label: serverList[i].name,
            description: serverList[i].ip,
            value: `selection${i}`,
        })
    }

    log.info('done')
    return {
        optionsArray: optionsArray,
        options: options,
    };
}
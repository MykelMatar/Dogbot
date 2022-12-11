import guilds from '../schemas/guild-schema'
import log from "../logger";
import {APISelectMenuOption, CommandInteraction} from "discord.js";
import {DiscordMenuOption, MenuGeneratorReturnValues} from "../myTypes";

/**
 * Generates interaction menu options for minecraft commands
 * 
 * @param interaction
 * @param guildName
 * @param listSize
 */
export async function McMenuOptionGenerator(interaction: CommandInteraction, guildName: string, listSize: number): Promise<MenuGeneratorReturnValues>{
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
        options.label[i] = serverList[i].name
        options.description[i] = serverList[i].ip
        options.value[i] = `selection${i}`
    }
    
    // generate discord-readable format for options
    for (let i = 0; i < listSize; i++) {
        optionsArray[i] = {
            label: options.label[i], 
            description: options.description[i], 
            value: options.value[i],
        }
    }
    log.info('done')
    return {
        optionsArray: optionsArray,
        options: options,
    };
}
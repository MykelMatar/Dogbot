import guilds from '../schemas/guild-schema'
import {log} from "../logger";
import {APISelectMenuOption, CommandInteraction} from "discord.js";

export async function generateMCMenuOptions(interaction: CommandInteraction, guildName: string, listSize: number): Promise<any>{
    let option: APISelectMenuOption[] = [], 
        label: string[] = [], 
        value: string[] = [], 
        description: string[] = []; 
    
    log.info('retrieving server list...')
    const currentGuild = await guilds.findOne({guildId: interaction.guildId})
    let serverList = currentGuild.MCServerData.serverList

    log.info('generating menu options...')
    for (let i = 0; i < listSize; i++) {
        label[i] = serverList[i].name
        description[i] = serverList[i].ip
        value[i] = `selection${i}`
    }
    
    // generate discord-readable format for options
    for (let i = 0; i < listSize; i++) {
        option[i] = ({label: label[i], description: description[i], value: value[i]})
    }
    log.info('done')
    return [option, label, value, description];
}
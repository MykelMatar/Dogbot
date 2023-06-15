import {Guild} from "discord.js";
import guilds from '../../dependencies/schemas/guild-schema'
import log from "../../dependencies/constants/logger";
import {NewClient} from "../../dependencies/myTypes";

export async function guildCreate(client: NewClient, guild: Guild) {
    log.info(`Dogbot added to ${guild.name}`)

    const guildName = guild.name.replace(/\s+/g, ""); //removes whitespace from string
    const existingGuild = await guilds.findOne({guildId: guild.id})
    if (existingGuild) return

    log.info('Creating database entry...')
    await guilds.create({
        guild: guildName,
        guildId: guild.id,
        settings: {
            autoDetectIP: true
        },
        mcServerData: {
            serverList: [],
            selectedServer: {
                name: null,
                ip: null
            }
        },
        userData: []
    })
    log.info('Done!')
}
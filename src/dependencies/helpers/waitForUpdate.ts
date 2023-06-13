import log from "../constants/logger";
import guilds from "../schemas/guild-schema";

export function waitForUpdate(guildData) {
    let updatedRecently = guildData.updatedAt > Date.now() - (10 * 60 * 60 * 1000); // true if updated in the last 10 seconds
    while (!updatedRecently) {
        guildData = guilds.findOne({guildId: guildData.id}) // refresh document info
        updatedRecently = guildData.updatedAt > Date.now() - (10 * 60 * 60 * 1000);
        log.info('Waiting for database update...')
    }
}
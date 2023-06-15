import log from "../constants/logger";
import guilds from "../schemas/guild-schema";

// export function waitForUpdate(guildData) {
//     let updatedRecently = guildData.updatedAt > Date.now() - (10 * 60 * 60 * 1000); // true if updated in the last 10 seconds
//     while (!updatedRecently) {
//         guildData = guilds.findOne({guildId: guildData.id}) // refresh document info
//         updatedRecently = guildData.updatedAt > Date.now() - (10 * 60 * 60 * 1000);
//         log.info('Waiting for database update...')
//     }
// }

export function waitForUpdate(guildData, timeoutMs: number = 2000): Promise<void> {
    const maxUpdateDelay = 10_000 // Maximum delay between updates in milliseconds

    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout;

    const checkForUpdate = async (resolve: () => void, reject: (error: Error) => void) => {

        if (Date.now() - guildData.updatedAt > maxUpdateDelay) {
            if (Date.now() - startTime >= timeoutMs) {
                clearTimeout(timeoutId);
            } else {
                log.info('Waiting for database update...');
                guildData = await guilds.findOne({guildId: guildData.guildId});
                await checkForUpdate(resolve, reject);
            }
        } else {
            clearTimeout(timeoutId);
            resolve();
        }
    };

    return new Promise<void>((resolve, reject) => {
        timeoutId = setTimeout(() => {
            log.error('Timeout: Database update not detected within the specified time.');
        }, timeoutMs);

        checkForUpdate(resolve, reject);
    });
}
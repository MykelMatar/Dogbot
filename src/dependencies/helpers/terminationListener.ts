import {InteractionCollector} from "discord.js";
import log from "../logger";
import {NewClient} from "../myTypes";

/**
 * graceful shutdown function. ends collectors to collect data
 *
 * @param client
 * @param collector
 * @param terminateInstance
 */
export async function terminationListener(client: NewClient, collector: InteractionCollector<any>, terminateInstance) {
    process.on('SIGINT', terminateInstance)
}

export function terminate(client, collector) {
    log.info('Shutting down collectors...')
    collector.stop()
    setTimeout(() => {
        log.info('Terminating Dogbot...')
        client.destroy()
        log.info('Done')
        process.exit(69)
    }, 2000) // wait for collector to finish
}

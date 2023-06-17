import {InteractionCollector} from "discord.js";
import log from "../../constants/logger";
import {CustomClient} from "../../myTypes";

/**
 * graceful shutdown function. ends collectors to collect data
 *
 * @param client
 * @param collector
 * @param terminateInstance
 */
export function terminationListener(client: CustomClient, collector: InteractionCollector<any>, terminateInstance) {
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
    }, 1000) // wait for collector to finish
}

export function removeTerminationListener(terminateInstance) {
    process.off('SIGINT', terminateInstance);
    process.off('SIGTERM', terminateInstance);
}

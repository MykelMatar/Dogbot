import {InteractionCollector} from "discord.js";
import log from "../logger";
import {newClient} from "../myTypes";

export async function terminationListener(client: newClient, collector: InteractionCollector<any>, terminate?: boolean) {
    process.on('SIGINT', () => {
        if (terminate === true){ // not required for npm scripts 
            log.info('Terminating Dogbot...')
            client.destroy()
            log.info('Done')
            process.exit(69)
        }
        terminate = true
        log.info('Shutting down collectors...')
        collector.stop()
        log.info('Press Ctrl+C again to shutdown')
    })
    process.on('SIGTERM', () => {
        log.info('SIGTERM detected')
        log.info('Shutting down collectors...')
        collector.stop()
    })
}

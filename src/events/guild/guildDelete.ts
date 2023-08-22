import {Guild} from "discord.js";
import log from "../../dependencies/constants/logger";
import {CustomClient} from "../../dependencies/myTypes";

// don't want to use this right now. maybe later.
export async function guildDelete(client: CustomClient, guild: Guild) {
    log.info(`Dogbot removed from guild ${guild.name}`);

    // delete guilds that have not seen activity for over a month
    // const oneMonthAgo = new Date();
    // oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    //
    // // Define the filter for selecting guilds that haven't been updated in over a month
    // const filter = {updatedAt: {$lte: oneMonthAgo}};
    //
    // // Delete the matching guilds
    // guilds.deleteMany(filter)
    //     .then((result) => {
    //         console.log(`${result.deletedCount} guilds deleted.`);
    //     })
    //     .catch((error) => {
    //         console.error('Error deleting guilds:', error);
    //     });

    // log.info('removing server data...')
    // guilds.findOne({guildId: guild.id})
    //     .deleteOne()
    //     .catch(err => log.info(err))
    // log.info('done!')
}
// @ts-nocheck
import {SlashCommandBuilder} from "discord.js";

export const updateSchema = {
    data: new SlashCommandBuilder()
        .setName('update-schema')
        .setDescription('update mongo schema (for test bot only)'),

    async execute() {


        // guilds.bulkWrite([
        //     {
        //         updateMany: {
        //             filter: {},
        //             update: {
        //                 $rename: {
        //                     "userData.$[].enlistStats": "userData.$[].fetchStats",
        //                     // "userData.$[].fetchStats.enlistXP": "userData.$[].fetchStats.fetchXP",
        //                     // "userData.$[].fetchStats.enlistStreak": "userData.$[].fetchStats.fetchStreak",
        //                 },
        //             },
        //         },
        //     },
        // ])
        //     .then(() => {
        //         console.log("Documents updated successfully.");
        //     })
        //     .catch((error) => {
        //         console.error("Error updating documents:", error);
        //     });
    }

}
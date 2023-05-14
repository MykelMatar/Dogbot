import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {IGuild, NewClient} from "../../dependencies/myTypes";
import guilds from "../../dependencies/schemas/guild-schema";

export const updateSchema = {
    data: new SlashCommandBuilder()
        .setName('update-schema')
        .setDescription('update mongo schema (for test bot only)'),
    
    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        guilds.updateMany({}, {timestamps: true}, (err, res) => {
            if (err) {
                console.error(err);
            } else {
                console.log(res.nModified + ' documents updated');
            }
        });
    }
}
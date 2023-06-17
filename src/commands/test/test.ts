import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {CustomClient, MongoGuild} from "../../dependencies/myTypes";

export const test = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('test'),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {
        client.emit('guildCreate', interaction.guild)
    }
}
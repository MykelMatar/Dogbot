import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {IGuild, NewClient} from "../../dependencies/myTypes";

export const test = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('test'),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
    }
}
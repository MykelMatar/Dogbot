import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {IGuild, NewClient} from "../../dependencies/myTypes";
import {getLevelFromXp} from "../../dependencies/helpers/getLevelFromXp";

export const getEnlistLevel = {
    data: new SlashCommandBuilder()
        .setName('enlist-level')
        .setDescription('gets current level for enlisting'),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        const {prestige, level} = getLevelFromXp(270000)
        await interaction.reply({content: `you are prestige ${prestige} level ${level}`, ephemeral: true})
    }
}
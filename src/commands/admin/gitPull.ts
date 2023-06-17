import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {CustomClient, SlashCommand} from "../../dependencies/myTypes";
import simpleGit, {SimpleGit} from 'simple-git';

export const gitPull: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('git-pull')
        .setDescription('pulls changes from github (removes the need to restart bot on sparked host)'),

    async execute(client: CustomClient, interaction: CommandInteraction) {
        if (interaction.user.id != '191754197203550208') return

        const git: SimpleGit = simpleGit();

        try {
            const result = await git.raw(['pull', '--force']);
            console.log(result)
            await interaction.reply({content: `pulled changes`, ephemeral: true})
        } catch (error) {
            console.error('Error during git pull:', error);
            await interaction.reply({content: `could not pull changes`, ephemeral: true})
        }
    }
}
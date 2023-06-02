import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {NewClient} from "../../dependencies/myTypes";
import {Octokit} from "@octokit/rest";

export const gitPull = {
    data: new SlashCommandBuilder()
        .setName('git-pull')
        .setDescription('pulls changes from github (removes the need to restart bot on sparked host)'),

    async execute(client: NewClient, interaction: CommandInteraction) {
        if (interaction.user.id != '191754197203550208') return

        // Create an instance of the Octokit client
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
        });

        // Define the repository and branch information
        const owner = 'MykelMatar';
        const repo = 'Dogbot';
        const branch = 'master';

        // Pull changes from the remote branch
        try {
            const response = await octokit.rest.pulls.create({
                owner: owner,
                repo: repo,
                head: `${owner}:${branch}`,
                base: branch,
            });

            console.log('Pull request created:', response.data);
            await interaction.reply(`pulled changes`)
        } catch (error) {
            console.error('Error pulling changes:', error);
            await interaction.reply(`could not pull changes`)
        }
    }
}
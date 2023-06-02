import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {NewClient} from "../../dependencies/myTypes";
import simpleGit, {SimpleGit} from 'simple-git';

export const gitPull = {
    data: new SlashCommandBuilder()
        .setName('git-pull')
        .setDescription('pulls changes from github (removes the need to restart bot on sparked host)'),

    async execute(client: NewClient, interaction: CommandInteraction) {
        if (interaction.user.id != '191754197203550208') return
        
        const git: SimpleGit = simpleGit();

        await git.pull()
            .then(async r => {
                console.log(r.summary)
                await interaction.reply({content: `pulled changes:\n${r.summary}`, ephemeral: true})
            }).catch(async e => {
                console.error(e)
                await interaction.reply({content: `could not pull changes`, ephemeral: true})
            })
    }
}
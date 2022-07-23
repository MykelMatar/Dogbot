import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {newClient} from "../../dependencies/myTypes";

export const setroleAutoenlist = {
    data: new SlashCommandBuilder() 
        .setName('setrole-autoenlist')
        .setDescription('sets role for automatic role detection and enlist prompt')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to be detected by Dogbot')
                .setRequired(true)),
        
    async execute(client: newClient, interaction: CommandInteraction, guildData?){
        guildData.ServerData.roles.autoenlist = interaction.options.data[0].value
        await guildData.save()

        await interaction.reply({ephemeral: true, content: 'Autoenlist role set sucessfully'})
        console.log('Autoenlist role set');
    }
}
import {CommandInteraction, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {newClient} from "../../dependencies/myTypes";

export const clearRoleAutoEnlist = {
    data: new SlashCommandBuilder() 
        .setName('clearrole-autoenlist')
        .setDescription('Clears role used to automate /enlist-users')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('description')
                .setDescription('details about event')
                .setRequired(false)),
        
    async execute(client: newClient, interaction: CommandInteraction, guildData){
        guildData.ServerData.roles.autoenlist = null;
        await guildData.save()
        await interaction.reply({ephemeral: true, content: '*Role cleared successfully*'})
    }
}
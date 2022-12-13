import {CommandInteraction, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {NewClient} from "../../dependencies/myTypes";

export const enlistSetRole = {
    data: new SlashCommandBuilder()
        .setName('enlist-set-role')
        .setDescription('sets role for automatic role detection and enlist prompt')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to be detected by Dogbot')
                .setRequired(true)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData) {
        guildData.ServerData.roles.autoenlist = interaction.options.data[0].value
        await guildData.save()
        await interaction.reply({ephemeral: true, content: 'Autoenlist role set sucessfully'})
    }
}
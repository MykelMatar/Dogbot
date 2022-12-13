import {CommandInteraction, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {GuildSchema, NewClient} from "../../dependencies/myTypes";

export const enlistClearRole = {
    data: new SlashCommandBuilder()
        .setName('enlist-clear-role')
        .setDescription('Clears role used to automate /enlist-users')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('description')
                .setDescription('details about event')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema) {
        guildData.ServerData.roles.autoenlist = null;
        await guildData.save()
        await interaction.reply({ephemeral: true, content: 'Role cleared successfully'})
    }
}
import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import {CustomClient, MongoGuild, SlashCommand} from "../../dependencies/myTypes";

export const fetchRole: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('fetch-role')
        .setDescription('Role settings for the role that is used when /fetch-users is sent')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role Dogbot will @ when the /fetch-users command is used')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('clear-role')
                .setDescription('Clears the role used by Dogbot when fetching gamers')
                .setRequired(false)),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild): Promise<void> {
        const options = interaction.options as CommandInteractionOptionResolver // ts thinks the .get options dont exist

        if (options.getRole('role')) {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                await interaction.reply({ephemeral: true, content: 'Only administrators can change and clear the role'})
                return
            }
            guildData.settings.fetchRole = options.getRole('role') as unknown as string
            await guildData.save()
            await interaction.reply({ephemeral: true, content: 'Autoenlist role set sucessfully'})
        } else if (options.getBoolean('clear-role')) {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                await interaction.reply({ephemeral: true, content: 'Only administrators can change and clear the role'})
                return
            }
            guildData.settings.fetchRole = null;
            await guildData.save()
            await interaction.reply({ephemeral: true, content: 'Role cleared successfully'})
        } else {
            let selectedRole = guildData.settings.fetchRole

            await interaction.reply({
                content: selectedRole != null ? `${selectedRole}` : `No role selected`,
                ephemeral: true
            });
        }


    }
}
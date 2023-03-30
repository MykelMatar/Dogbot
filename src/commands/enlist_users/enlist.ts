import {CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder} from "discord.js";
import {IGuild, NewClient} from "../../dependencies/myTypes";

export const enlist = {
    data: new SlashCommandBuilder()
        .setName('enlist')
        .setDescription('test')
        .addSubcommand(subcommand =>
            subcommand
                .setName('users')
                .setDescription('test')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('stats')
        ),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild) {
        let options = interaction.options as CommandInteractionOptionResolver
        let subcommand = options.getSubcommand()
        await client.commands.get(`enlist-${subcommand}`).execute(client, interaction, guildData)
    }
}
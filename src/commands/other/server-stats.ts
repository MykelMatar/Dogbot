import {CommandInteraction, EmbedBuilder, Guild, GuildMember, SlashCommandBuilder} from "discord.js";
import {embedColor, NewClient} from "../../dependencies/myTypes";

export const serverStats = {
    data: new SlashCommandBuilder()
        .setName('server-stats')
        .setDescription('Displays some stats of the discord server')
        .addStringOption(option =>
            option.setName('hide')
                .setDescription('Whether to hide the response or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction) {
        const guild: Guild = interaction.guild
        let owner: GuildMember = await guild.members.fetch(guild.ownerId)
        let verification: string = guild.verified ? 'Verified ✅' : 'Not Verified';

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}'s Stats`)
            .addFields(
                {name: `Owner`, value: `${owner}`, inline: true},
                {name: `Creation Date`, value: `${guild.createdAt}`, inline: true},
                {name: `Date Dogbot was Added`, value: `${guild.joinedAt}`, inline: true},
                {name: 'Member Count', value: `${guild.memberCount}`, inline: true},
                {name: `Server Verification⠀⠀`, value: verification, inline: true},
                {name: 'Premium Tier', value: `${guild.premiumTier}`, inline: true},
            )
            .setColor(embedColor)

        await interaction.editReply({embeds: [embed]})
    }
}

import {Guild, GuildMember, EmbedBuilder, CommandInteraction, SlashCommandBuilder} from "discord.js";
import {newClient} from "../../dependencies/myTypes";

export const serverStats = {
    data: new SlashCommandBuilder() 
        .setName('server-stats')
        .setDescription('Displays some stats of the discord server')
        .addStringOption(option =>
            option.setName('hide')
                .setDescription('Whether to hide the response or not')
                .setRequired(false)),
        
    async execute(client: newClient, interaction: CommandInteraction){
        const guild: Guild = interaction.guild
        let owner: GuildMember = await guild.members.fetch(guild.ownerId)
        let verification: string

        if (guild.verified) verification = 'Verified ✅'
        else verification = 'Not Verified';

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}'s Stats`)
            .addFields(
                {name: `Owner` , value: `${owner}`, inline: true},
                {name: `Creation Date` , value: `${guild.createdAt}`, inline: true},
                {name: `Date Dogbot was Added` , value: `${guild.joinedAt}`, inline: true},
                {name: 'Member Count', value: `${guild.memberCount}`, inline: true},
                {name: `Server Verification⠀⠀` , value: verification, inline: true},
                {name: 'Premium Tier', value: `${guild.premiumTier}`, inline: true},
            )
            .setColor("#8570C1")

        await interaction.editReply({embeds: [embed]})
    }
}
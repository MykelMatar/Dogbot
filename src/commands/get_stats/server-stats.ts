import {Command} from "../../dependencies/classes/Command";
import {Guild, GuildMember, MessageEmbed} from "discord.js";

export const serverStats = new Command(
    'server-stats',
    'displays relevant discord server stats',
    async (client, interaction) => {
        
        const guild: Guild = interaction.guild
        let owner: GuildMember = await guild.members.fetch(guild.ownerId)
        let verification: string
        
        if (guild.verified) verification = 'Verified ✅'
        else verification = 'Not Verified';
        
        const embed = new MessageEmbed()
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
)
const { MessageEmbed } = require('discord.js')

module.exports = {
    name: 'server-stats',
    description: 'displays server information',
    async execute(client, interaction, guildName) {
        console.log(`server-stats requested by ${interaction.member.user.username} in ${interaction.member.guild.name}`)
        
        const { guild } = interaction
        
        const embed = new MessageEmbed()
            .setTitle(`${guild.name}`)
            .addFields(
                { name: 'Owner', value:'ownerid' },
                { name: 'Member Count', value: `${guild.member_count}`},
                { name: 'Online Member Count', value: `${guild.presences}` },
                { name: 'Creation Date', value: `${guild.createdAt}` },
                { name: 'test', value:'test' }
                
            )
    if (!(guild.description === null)) embed.setDescription(`${guild.description}`)
        
    await interaction.reply({ ephemeral: true, embeds: [embed]})
    }
}
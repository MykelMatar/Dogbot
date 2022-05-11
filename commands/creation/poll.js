const {MessageActionRow, MessageButton} = require("discord.js");
module.exports = {
    name: 'poll',
    description: 'creates and sends a poll',
    async execute(client, interaction, guildName) {
        console.log(`poll requested by ${interaction.member.user.username}`)
        
        
        
        // generate buttons
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('Enlist')
                    .setLabel('Enlist')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('Reject')
                    .setLabel('Reject')
                    .setStyle('DANGER'),
            );
    }
}
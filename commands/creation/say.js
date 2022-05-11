
module.exports = {
    name: 'say',
    description: 'sends a message via Dogbot',
    async execute(client, interaction) {
        console.log(`say requested by ${interaction.member.user.username}`)
        
        await interaction.reply({  ephemeral: true , content: 'message sent'});
        interaction.channel.send(`${interaction.options._hoistedOptions[0].value}`)
    }
}
module.export = {
    name: 'poll',
    description: 'creates and sends a poll',
    async execute(client, interaction, guildName) {
        console.log(`poll requested by ${interaction.member.user.username}`)
        
    }
}
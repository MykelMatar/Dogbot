module.export = {
    name: 'say',
    description: 'sends a message via Dogbot',
    async execute(client, interaction, guildName) {
        console.log(`say requested by ${interaction.member.user.username}`)
        
    }
}
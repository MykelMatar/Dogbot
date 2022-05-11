
module.exports = {
    name: 'embed',
    description: 'creates and send embed to channel',
    async execute(client, interaction, guildName) {
        console.log(`embed requested by ${interaction.member.user.username}`)

        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }
    }
}
const guilds = require("../../schemas/guild-schema");


module.exports = {
    name: 'clearrole-autoenlist',
    description: 'clears the role used to enlist',
    async execute(client, interaction) {
        console.log(`clearrole requested by ${interaction.member.user.username} in ${interaction.member.guild.name}`)

        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }

        // retrieve server doc and list from mongo
        const currentGuild = await guilds.findOne({guildId: interaction.guildId})

        // clear role id and push to mongo
        currentGuild.ServerData.roles.autoenlist = null;
        await currentGuild.save()

        interaction.reply({ephemeral: true, content: 'Role Cleared Successfully'})
        console.log("Role cleared");
    }
}
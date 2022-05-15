const guilds = require("../../schemas/guild-schema");


module.exports = {
    name: 'clearrole-default',
    description: 'clears the role used to enlist',
    async execute(client, interaction, guildName) {
        console.log(`clearrole requested by ${interaction.member.user.username}`)

        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return await interaction.reply('Only Admins can use this command') }

        // push role id to json
        const currentGuild = await guilds.findOne({guildId: interaction.guildId})
        currentGuild.ServerData.roles.default = null;
        await currentGuild.save();

        await interaction.reply({ephemeral: true, content: 'Role Cleared Successfully'})
        console.log("Role cleared");
    }
}
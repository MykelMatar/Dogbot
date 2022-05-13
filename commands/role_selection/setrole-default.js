const guilds = require('../../schemas/guild-schema')


module.exports = {
    name: 'setrole-default',
    description: 'changes the role given to new users upon joining',
    async execute(client, interaction, guildName) {
        console.log(`setrole-default requested by ${interaction.member.user.username}`)
        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }
         
        // retrieve role and push role id to db
        const currentGuild = await guilds.find({guildId: interaction.guildId})
        currentGuild[0].ServerData.roles.default = interaction.options._hoistedOptions[0].value;
        await currentGuild[0].save();

        await interaction.editReply("default role set successfully")
        console.log("default role set");
    }

}
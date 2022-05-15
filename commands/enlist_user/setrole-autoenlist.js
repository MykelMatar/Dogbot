const guilds = require("../../schemas/guild-schema");


module.exports = {
    name: 'setrole-autoenlist',
    description: 'changes the role used to trigger autoenlist',
    async execute(client, interaction, guildName) {
        console.log(`setrole-autoenlist requested by ${interaction.member.user.username}`)

        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }

        // retrieve server doc and list from mongo
        const currentGuild = await guilds.find({guildId: interaction.guildId})
        
        // push role id to mongo
        currentGuild[0].ServerData.roles.autoenlist = interaction.options._hoistedOptions[0].value;
        await currentGuild[0].save()

        await interaction.editReply("Autoenlist role set sucessfully")
        console.log("Autoenlist role set");
    }
}
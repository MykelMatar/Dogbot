const guilds = require("../../schemas/guild-schema");


module.exports = {
    name: 'setrole-autoenlist',
    description: 'changes the role used to trigger autoenlist',
    async execute(client, interaction) {
        console.log(`setrole-autoenlist requested by ${interaction.member.user.username} in ${interaction.member.guild.name}`)

        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }

        // retrieve server doc and list from mongo
        const currentGuild = await guilds.findOne({guildId: interaction.guildId})
        
        // push role id to mongo
        currentGuild.ServerData.roles.autoenlist = interaction.options._hoistedOptions[0].value;
        await currentGuild.save()

        await interaction.editReply("Autoenlist role set sucessfully")
        console.log("Autoenlist role set");
    }
}
const data = require('../../data.json');
const writeToJson = require('../../helperFunctions/writeToJson');
const createInteraction = require('../../helperFunctions/createInteraction');



module.exports = {
    name: 'setrole-autoenlist',
    description: 'changes the role used to trigger autoenlist',
    async execute(client, interaction, guildName) {
        console.log(`setrole-autoenlist requested by ${interaction.member.user.username}`)

        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }

        // push role id to json
        data.Guilds[guildName].ServerData['roles'].autoenlist = interaction.options._hoistedOptions[0].value;
        writeToJson(data);

        await interaction.editReply("autoenlist role set sucessfully")
        console.log(" autoenlist role set");
    }

}
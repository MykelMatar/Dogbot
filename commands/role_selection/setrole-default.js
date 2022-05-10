const data = require('../../data.json');
const writeToJson = require('../../helperFunctions/writeToJson');



module.exports = {
    name: 'setrole-default',
    description: 'changes the role given to new users upon joining',
    async execute(client, interaction, guildName) {
        console.log(`setrole-default requested by ${interaction.member.user.username}`)

        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }

        // retrieve role 
        let role = interaction.options._hoistedOptions[0].value

        // push role id to json
        data.Guilds[guildName].ServerData['roles'].default = role;
        writeToJson(data);

        await interaction.editReply("default role set successfully")
        console.log("default role set");
    }

}
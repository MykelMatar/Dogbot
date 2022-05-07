const data = require('../../data.json');
const writeToJson = require('../../helperFunctions/writeToJson');
const createInteraction = require('../../helperFunctions/createInteraction');



module.exports = {
    name: 'clearrole-default',
    description: 'clears the role used to enlist',
    async execute(client, interaction, guildName) {
        console.log(`clearrole requested by ${interaction.member.user.username}`)

        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }

        // push role id to json
        data.Guilds[guildName].ServerData['selectedRole'] = null;
        writeToJson(data);

        interaction.reply({ephemeral: true, content: 'Role Cleared Successfully'})
        console.log("Role cleared");
    }
}
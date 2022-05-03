const data = require('../data.json');
const writeToJson = require('../helperFunctions/writeToJson');
const createInteraction = require('../helperFunctions/createInteraction');
let cmdStatus = 0;



module.exports = {
    name: 'setrole',
    description: 'changes the role used to enlist',
    async execute(client, interaction, guildName) {
        console.log(`setrole requested by ${interaction.member.user.username}`)

        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }
        if (cmdStatus == 1) { return interaction.editReply('setrole command already running.') }
        cmdStatus = 1;

        // retrieve role 
        let role = interaction.options._hoistedOptions[0].value

        // push role id to json
        data.Guilds[guildName].ServerData['selectedRole'] = role;
        writeToJson(data);

        interaction.editReply("Role set sucessfully")
        console.log("Role set");
        cmdStatus = 0;
    }

}
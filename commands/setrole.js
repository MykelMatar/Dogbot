const data = require('../data.json');
const writeToJson = require('../helperFunctions/writeToJson');
const createInteraction = require('../helperFunctions/createInteraction');
let cmdStatus = 0;



module.exports = {
    name: 'setrole',
    description: 'changes the role used to enlist',
    async execute(client, message, guildName) {
        console.log(`setrole requested by ${interaction.member.user.username}`)

        if (!message.member.permissions.has("ADMINISTRATOR")) { return message.reply('Only Admins can use this command') }
        if (cmdStatus == 1) { return message.reply('setrole command already running.') }
        cmdStatus = 1;

        // create collector
        const filter = i => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', max: 1, time: 10000 }); // only message author can interact, 1 response, 10s timer 

        // retrieve role 
        var role = await createInteraction(message, 'Enter your desired role. If you want to clear the role to remove this functionality, type "CLEAR"', 'Request timed out, please try again')
        
        // if no input, do nothing
        if (role == undefined) return cmdStatus = 0;

        // if input is 'CLEAR', remove selected role from json file
        if (role == "CLEAR" || role == "clear") {
            data.Guilds[guildName].ServerData['selectedRole'] = null;
            writeToJson(data);
            message.reply("Role removed sucessfully")
            console.log("Role removed");
            return cmdStatus = 0;
        }

        // otherwise, push role id to json
        data.Guilds[guildName].ServerData['selectedRole'] = role;
        writeToJson(data);

        message.reply("Role set sucessfully")
        console.log("Role set");
        cmdStatus = 0;

    }

}
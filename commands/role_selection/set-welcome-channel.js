const data = require('../../data.json');
const writeToJson = require('../../helperFunctions/writeToJson');



module.exports = {
    name: 'set-welcome-channel',
    description: 'changes server welcome channel',
    async execute(client, interaction, guildName) {
        console.log(`set-welcome-channel requested by ${interaction.member.user.username}`)

        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }

        // retrieve channel 
        let channel = interaction.options._hoistedOptions[0].value

        // make sure channel is text channel
        let channelType = interaction.guild.channels.cache.get(channel).type;
        if (channelType == 'GUILD_VOICE') {
            return interaction.editReply("Welcome channel cannot be a voice channel")
        }

        // push channel id to json
        data.Guilds[guildName].ServerData.welcomeChannel = channel;
        writeToJson(data);

        interaction.editReply("welcome channel set sucessfully")
        console.log("welcome channel set");
    }

}
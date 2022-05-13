const data = require('../../data.json');
const writeToJson = require('../../helperFunctions/writeToJson');
const createInteraction = require('../../helperFunctions/promptResponse');
const guilds = require("../../schemas/guild-schema");


module.exports = {
    name: 'clearrole-default',
    description: 'clears the role used to enlist',
    async execute(client, interaction, guildName) {
        console.log(`clearrole requested by ${interaction.member.user.username}`)

        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return await interaction.reply('Only Admins can use this command') }

        // push role id to json
        const currentGuild = await guilds.find({guildId: interaction.guildId})
        currentGuild[0].ServerData.roles.default = null;
        await currentGuild[0].save();

        await interaction.reply({ephemeral: true, content: 'Role Cleared Successfully'})
        console.log("Role cleared");
    }
}
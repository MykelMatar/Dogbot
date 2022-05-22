const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const generateMcMenuOptions = require('../../helperFunctions/mc_helpers/generateMcMenuOptions');
const guilds = require("../../schemas/guild-schema");
let cmdStatus = 0;


module.exports = {
    name: 'mc-change-server-name',
    description: "Renames existing mc server. Accessible via '/mc-list-servers' button or by calling command.",
    async execute(client, interaction, guildName) {
        console.log(`/mc-change-server-name requested by ${interaction.member.user.username} in ${interaction.member.guild.name}`);

        // check for admin perms & prevent multiple instances from running
        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }  // check for admin perms
        if (cmdStatus === 1) { return interaction.editReply('/mc-change-server-name command already running.') } // prevent multiple instances from running
        cmdStatus = 1;

        // retrieve server doc and list from mongo
        const currentGuild = await guilds.find({guildId: interaction.guildId})
        let serverList = currentGuild[0].MCServerData.serverList
        let serverListSize = serverList.length

        // make sure there is at least 1 server
        if (serverListSize === 0) {
            await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
            return cmdStatus = 0;
        }

        // retrieve new name from user input
        let newName = interaction.options._hoistedOptions[0].value
        
        // verify that name is not already registered under a different IP
        if (serverList.some(function (o) {return o["name"] === newName;})) {
            await interaction.editReply(
                "Cannot have duplicate server names, please choose a different name or use /mc-change-server-ip to change the IP of the existing server"
            );
            return cmdStatus = 0;
        }
        
        // create variables and generate options for select menu
        let options = [];
        options = await generateMcMenuOptions(guildName, interaction, serverListSize);
        let option = options[0];

        // generate select menu
        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('change-server-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(option),
            );

        // send embed and store in variable to edit later
        await interaction.editReply({ content: 'Select the server you want to rename', ephemeral: true, components: [row] });

        // Response collection and handling
        let filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: 15000 });
        let serverName

        collector.on('collect', async i => {
            if (i.customId !== 'change-server-menu') return collector.stop()
            for (let j = 0; j < serverListSize; j++) {
                if (i.values[0] === `selection${j}`) {
                    serverName = currentGuild[0].MCServerData.serverList[j].name
                    currentGuild[0].MCServerData.serverList[j].name = newName
                }
            }
            // change selected server name if it was changed
            if (currentGuild[0].MCServerData.selectedServer.name === serverName) 
                currentGuild[0].MCServerData.selectedServer.name = newName
            
            await currentGuild[0].save() // save changes to mongo
            collector.stop()
        });

        collector.on('end', async collected => {
            if (collected.size === 0)
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Request Timeout',
                    components: []
                })
            else if (collected.first().customId !== 'change-server-menu')
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Avoid using multiple commands at once',
                    components: []
                })
            else if (collected.first().customId === 'change-server-menu')
                await interaction.editReply({ content: ` ${serverName} renamed successfully to ${newName}`, ephemeral: true, components: [] })
            cmdStatus = 0;
        });
    }
}

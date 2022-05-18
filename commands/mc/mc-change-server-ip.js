const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const util = require('minecraft-server-util');
const generateMcMenuOptions = require('../../helperFunctions/mc_helpers/generateMcMenuOptions');
const guilds = require("../../schemas/guild-schema");
let cmdStatus = 0;


module.exports = {
    name: 'mc-change-server-ip',
    description: "changes IP of existing server.",
    async execute(client, interaction, guildName) {
        console.log(`mc-change-server-ip requested by ${interaction.member.user.username}`);

        // check for admin perms & prevent multiple instances from running
        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }  // check for admin perms
        if (cmdStatus === 1) { return interaction.editReply('mc-change-server-ip command already running.') } // prevent multiple instances from running
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

        // retrieve server IP from user input
        let ip = interaction.options._hoistedOptions[0].value
        
        // verify that IP is not already registered
        if (serverList.some(function (o) {return o["ip"] === ip;})) {
            await interaction.editReply(
                "Server already registered, double check the IP or use **!renamemc** to change the name"
            );
            console.log("Duplicate IP Detected");
            return (cmdStatus = 0);
        }

        // make sure IP is a valid server IP by checking its status (server must be online for this to work)
        try {
            await util.status(ip)
        } catch (error) {
            await interaction.editReply('Could not retrieve server status. Double check IP and make sure server is online.')
            console.log('Invalid Server IP / Server Offline');
            cmdStatus = 0;
        }

        // create variables and generate options for select menu
        let options = [];
        options = await generateMcMenuOptions(guildName, interaction, serverListSize);
        let option = options[0];

        // generate select menu
        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('change-ip-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(option),
            );

        // send embed and store in variable to edit later
        await interaction.editReply({ ephemeral: true, content: 'Select the server you want to change the IP of', components: [row] });

        // Response collection and handling
        let filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', max: 1, time: 15000 });
        let serverName;
        
        collector.on('collect', async i => {
            if (i.customId !== 'change-ip-menu') return collector.stop()
            // find selection and replace corresponding ip in mongo
            for (let j = 0; j < serverListSize; j++) {
                if (i.values[0] === `selection${j}`) 
                    currentGuild[0].MCServerData.serverList[j].ip = ip
                    serverName = currentGuild[0].MCServerData.serverList[j].name
            }
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
            else if (collected.first().customId !== 'change-ip-menu')
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Avoid using multiple commands at once',
                    components: []
                })
            else if (collected.first().customId === 'change-ip-menu')
                await interaction.editReply({ content: serverName + ' IP changed successfully', ephemeral: true, components: [] })
            
            cmdStatus = 0;
        });
    }
}

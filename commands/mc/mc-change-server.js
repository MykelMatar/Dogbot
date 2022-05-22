const {MessageActionRow, MessageSelectMenu} = require('discord.js');
const generateMcMenuOptions = require('../../helperFunctions/mc_helpers/generateMcMenuOptions');
const guilds = require("../../schemas/guild-schema");
let cmdStatus = 0;


module.exports = {
    name: 'mc-change-server',
    description: "Changes Server that is Being Tracked. Accessible via 'mc' or 'listmc' buttons, or by calling command.",
    async execute(client, interaction, guildName) {
        console.log(`changemc requested by ${interaction.member.user.username} in ${interaction.member.guild.name}`);

        // prevent multiple instances from running
        if (cmdStatus === 1) {
            return interaction.editReply('changemc command already running.')
        }
        cmdStatus = 1;

        // retrieve server doc and list from mongo
        const currentGuild = await guilds.find({guildId: interaction.guildId})
        let serverList = currentGuild[0].MCServerData.serverList
        let serverListSize = serverList.length

        // make sure there are at least 2 servers
        if (serverListSize === 0) {
            await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
            return cmdStatus = 0;
        } else if (serverListSize === 1) {
            await interaction.editReply('Only 1 Registered Server, use /mc-add-server or /mc-list-servers to add more servers.')
            return cmdStatus = 0;
        }

        // create variables and generate options for select menu
        let options = [];
        options = await generateMcMenuOptions(guildName, interaction, serverListSize);
        let option = options[0];
        let label = options[1];
        let description = options[3]

        // generate select menu
        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('change-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(option),
            );

        // send embed and store in variable to edit later
        await interaction.editReply({content: 'Select a Different Server to Check', components: [row], embeds: []});

        // Response collection and handling
        const filter = i => i.user.id === interaction.member.user.id
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'SELECT_MENU',
            time: 15000
        });
        const command = client.commands.get('mc-server-status');

        collector.on('collect', async i => {
            // find user selection and change mongo doc info
            if (i.customId !== 'change-menu') return collector.stop()
            for (let j = 0; j < serverListSize; j++) {
                if (i.values[0] === `selection${j}`) {
                    currentGuild[0].MCServerData.selectedServer.name = label[j];
                    currentGuild[0].MCServerData.selectedServer.ip = description[j];
                }
            }
            await currentGuild[0].save() // write to mongo
            collector.stop()
        });

        // check whether a user responded or not, and edit embed accordingly
        collector.on('end', async collected => {
            if (collected.size === 0) 
                await interaction.editReply({
                    ephemeral: true, 
                    content: 'Request Timeout', 
                    components: []
                })
            else if (collected.first().customId !== 'change-menu') 
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Avoid using multiple commands at once',
                    components: []
                })
            else if (collected.first().customId === 'change-menu') {
                await interaction.editReply({
                    ephemeral: true,
                    content: `Server Updated, now Tracking ${currentGuild[0].MCServerData.selectedServer.name}. Retrieving server status...`,
                    components: []
                })
               await command.execute(client, interaction, guildName)
            } 
            cmdStatus = 0;
        });
    }
}


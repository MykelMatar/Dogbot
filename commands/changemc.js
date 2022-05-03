const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const util = require('minecraft-server-util');
const data = require('../data.json');
const writeToJson = require('../helperFunctions/writeToJson');
const refreshServerStatus = require('../helperFunctions/refreshServerStatus');
const generateMenuOptions = require('../helperFunctions/generateMenuOptions');
const preventInteractionCollision = require('../helperFunctions/preventInteractionCollision');
let cmdStatus = 0;




module.exports = {
    name: 'changemc',
    description: "Changes Server that is Being Tracked. Accessible via 'mc' or 'listmc' buttons, or by calling command.",
    async execute(client, interaction, guildName) {
        console.log(`changemc requested by ${interaction.member.user.username}`);

        // prevent multiple instances from running
        if (cmdStatus == 1) { return interaction.editReply('changemc command already running.') } 
        cmdStatus = 1;

        // retrieve length of serverList in JSON to use as menu length
        let serverListSize = Object.values(data.Guilds[guildName].MCData.serverList).length

        // make sure there are at least 2 servers
        if (serverListSize == 0) {
            interaction.editReply('No Registered Servers, use !addmc or !listmc to add servers.')
            return cmdStatus = 0;
        }
        else if (serverListSize == 1) {
            interaction.editReply('Only 1 Registered Server, use !addmc or !listmc to add more servers.')
            return cmdStatus = 0;
        }

        // create variables and generate options for select menu
        var options = [];
        options = await generateMenuOptions(guildName, serverListSize);
        let option = options[0];
        let label = options[1];
        let value = options[2];
        let description = options[3]

        console.log(option);

        // generate select menu
        row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('selection')
                    .setPlaceholder('Nothing selected')
                    .addOptions(option),
            );

        // send embed and store in variable to edit later
        await interaction.editReply({ content: 'Select a Different Server to Check', components: [row] });

        // Response collection and handling
        const filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, componentType: 'SELECT_MENU', time: 15000 }); //componentType: 'SELECT_MENU',
        const command = client.commands.get('mc');

        await preventInteractionCollision(interaction, collector);

        collector.on('collect', async i => {
            var selection = i.values[0]
            // find user selection and push new selected server info to JSON
            for (let i = 0; i < serverListSize; i++) {
                if (selection == `selection${i}`) {
                    var newTitle = label[i];
                    var newIP = description[i];
                    data.Guilds[guildName].MCData.selectedServer["title"] = newTitle;
                    data.Guilds[guildName].MCData.selectedServer["IP"] = newIP;
                    writeToJson(data);
                }
            }

        });

        // check whether a user responded or not, and edit embed accordingly
        collector.on('end', async collected => {
            let serverName = data.Guilds[guildName].MCData.selectedServer["title"]
            console.log(`changemc collected ${collected.size} selections`)
            if (collected.size == 1) await interaction.editReply({ ephemeral: true, content: `Server Updated. Now Tracking: ${serverName}`, components: [] })
            else await interaction.editReply({ephemeral: true, content: 'Request Timeout', components: [] })
            cmdStatus = 0;
        });
    }
}


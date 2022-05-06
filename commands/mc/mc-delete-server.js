const { MessageActionRow, MessageSelectMenu} = require('discord.js');
const data = require('../../data.json');
const writeToJson = require('../../helperFunctions/writeToJson');
const generateMenuOptions = require('../../helperFunctions/generateMenuOptions');
const preventInteractionCollision = require('../../helperFunctions/preventInteractionCollision');
let cmdStatus = 0;






module.exports = {
    name: 'delmc',
    description: "Removes server from server list in JSON file. Accessible via 'listmc' button or by calling command",
    async execute(client, interaction, guildName) {
        console.log(`del requested by ${interaction.member.user.username}`);

        // check for admin perms & prevent multiple instances from running
        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }  // check for admin perms
        if (cmdStatus == 1) { return interaction.reply('delmc command already running.') } // prevent multiple instances from running
        cmdStatus = 1;

        let serverList = data.Guilds[guildName].MCData.serverList;
        let serverListSize = Object.values(serverList).length

        // ensures command does not execute if 0 or 1 server exists
        if (serverListSize == 0) { 
            interaction.editReply('No Registered Servers, use !addmc or !listmc to add servers.')
            return cmdStatus = 0;
        }
        if (serverListSize == 1) { 
            interaction.editReply('Cannot remove the only existing server, use !addmc or !listmc to add servers, or change server information with !renamemc and !changemcip.') 
            return cmdStatus = 0;
        }

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

        await interaction.editReply({ content: 'Select a Server to Delete', components: [row] });

        const filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', max: 1, time: 15000 });
        var serverName;
   
        await preventInteractionCollision(interaction, collector)

        collector.on('collect', async i => {

            var selection = i.values[0];
            for (let i = 0; i < serverListSize; i++) {
                if (selection == `selection${i}`) {
                    let selectedServer = data.Guilds[guildName].MCData.selectedServer
                    let selectedServerIP = Object.values(data.Guilds[guildName].MCData.selectedServer)[1]
                    serverName = Object.keys(serverList)[i]
                    let serverIP = Object.values(serverList)[i]
                    delete serverList[serverName];
                    if (selectedServerIP == serverIP) {
                        selectedServer['title'] = Object.keys(serverList)[0]
                        selectedServer["IP"] = Object.values(serverList)[0]
                    }
                    writeToJson(data);
                }
            }

            if (i.customId === "selection") {
                let MCEmbedId = data.Guilds[guildName].Embeds.MCEmbedId;

                await i.update({ content: 'Server Deleted', components: [] });
            }
        });

        collector.on('end', async collected => {
            console.log(`delmc collected ${collected.size} menu selections`)
            if (collected.size == 1) await interaction.editReply({ content: serverName + ' Deleted', components: [] })
            else await interaction.editReply({ content: 'Request Timeout', components: [] })
        });

        cmdStatus = 0;
    }
}
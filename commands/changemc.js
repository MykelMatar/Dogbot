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
    async execute(client, message, args, guildName) {
        console.log('changemc detected');

        // prevent multiple instances from running
        if (cmdStatus == 1) { return message.reply('changemc command already running.') } 
        cmdStatus = 1;

        // retrieve length of serverList in JSON to use as menu length
        let serverListSize = Object.values(data.Guilds[guildName].MCData.serverList).length

        // make sure there are at least 2 servers
        if (serverListSize == 0) {
            message.reply('No Registered Servers, use !addmc or !listmc to add servers.')
            return cmdStatus = 0;
        }
        else if (serverListSize == 1) {
            message.reply('Only 1 Registered Server, use !addmc or !listmc to add more servers.')
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
        let sent = await message.reply({ content: 'Select a Different Server to Check', ephemeral: true, components: [row] });

        // Response collection and handling
        const filter = i => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, max: 1, componentType: 'SELECT_MENU', time: 15000 }); //componentType: 'SELECT_MENU',
        const command = client.commands.get('mc');

        await preventInteractionCollision(message, collector, sent);

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

            // edit embed to confirm user selection and remove menu
            if (i.customId === "selection") {
                let MCEmbedId = data.Guilds[guildName].Embeds.MCEmbedId;
                const msg = await (await message.channel.messages.fetch(MCEmbedId));
                refreshServerStatus(msg, guildName);  // refresh embed immediately

                await i.update({ content: 'Server Updated: Now tracking ' + newTitle, components: [] });
                console.log('Now tracking ' + newTitle);
            }
        });

        // check whether a user responded or not, and edit embed accordingly
        collector.on('end', async collected => {
            console.log(`changemc collected ${collected.size} selections`)
            if (collected.size == 1) await sent.edit({ content: 'Server Updated', ephemeral: true, components: [] })
            else await sent.edit({ content: 'Request Timeout', ephemeral: true, components: [] })
            cmdStatus = 0;
        });
    }
}


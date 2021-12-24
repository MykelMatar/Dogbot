const {MessageActionRow, MessageSelectMenu} = require('discord.js');
const data = require('../data.json');
const fs = require('fs');
let cmdStatus = 0;




// TODO: Change interaction to dropdown menu instead of message interaction, make sure new server gets selected for tracking (can default to item 0)

module.exports = {
    name: 'delmc', 
    description: "Removes server from server list in JSON file. Accessible via 'listmc' button or by calling command", 
    async execute(client, message, args, guildName){
        console.log('delmc detected');

        // check for admin perms
        if (!message.member.permissions.has("ADMINISTRATOR")) {
            message.reply('Only Admins can use this command')
            return;
        }
        // prevent multiple instances from running
        if (cmdStatus == 1) {
            message.reply('delmc command already running.')
            return;
        }
        cmdStatus = 1; 
        
        let serverListSize = Object.values(data.Guilds[guildName].MCData.serverList).length 

        if (serverListSize == 0) {
            message.reply('No Registered Servers, use !addmc or !listmc to add servers.')
        }

        var options = [];
        options = await generateOptions(guildName, serverListSize);
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

        let sent = await message.reply({ content: 'Select a Different Server to Check', ephemeral: true, components: [row] });

        const filter = i =>  i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({filter, componentType: 'SELECT_MENU', max: 1, time: 15000 });
        const command = client.commands.get('mc');

        collector.on('collect', async i => {
            var selection = i.values[0]
            for (let i = 0; i < serverListSize; i++) {
                if(selection == `selection${i}`){
                    let serverName = Object.keys(data.Guilds[guildName].MCData.serverList)[i]
                    delete data.Guilds[guildName].MCData.serverList[serverName];
                    writeToJson(data);
                }  
            }

            if (i.customId === "selection") {
                let MCEmbedId = data.Guilds[guildName].Embeds.MCEmbedId;
                
                await i.update({ content: 'Server Deleted', components: []});
            }
        });
        
        collector.on('end', async collected => {
            console.log(`Collected ${collected.size} items`)
            if (collected.size == 1) await sent.edit({ content: 'Server Deleted', ephemeral: true, components: [] })
            else await sent.edit({ content: 'Request Timeout', ephemeral: true, components: [] })
            cmdStatus = 0;
        });


        cmdStatus = 0;
    }
}



/**
 * refreshes the "Menu Options" in data.JSON and creates a drowpdown menu
 * @param  {string} guildName
 * @param  {int} listSize
 */
 async function generateOptions(guildName, listSize) {
    var option = [], label = [], value = [], description = [];
    // delete all entries (max of 10)
    console.log('deleting entries');
    for (let i = 0; i < 9; i++) {      
        delete data.Guilds[guildName].MenuOptions[i];
        writeToJson(data);
    }
    
    // create and push new entries
    console.log('creating new entries');
    for (let i = 0; i < listSize; i++) {    
        var newJson = {
            label : Object.keys(data.Guilds[guildName].MCData.serverList)[i],
            description : Object.values(data.Guilds[guildName].MCData.serverList)[i],
            value : `selection${i}`
        }
        
        data.Guilds[guildName].MenuOptions[i] = newJson;
        writeToJson(data);
    }

    // retrive Menu Options from JSON
    console.log('generating options')
    for (let i = 0; i < listSize; i++) {
        label[i] = JSON.stringify(data.Guilds[guildName].MenuOptions[i].label, null, 2).replace(/[""]/g, '')
        description[i] = JSON.stringify(data.Guilds[guildName].MenuOptions[i].description, null, 2).replace(/[""]/g, '')
        value[i] = JSON.stringify(data.Guilds[guildName].MenuOptions[i].value, null, 2).replace(/[""]/g, '')
    }

    // generate discord-readable format for options
    for (let i = 0; i < listSize; i++) {
        option[i] = ({label: label[i], description: description[i], value: value[i]})
    }
    console.log('done')
    return [option, label, value, description];
}



/**
 * writes data to data.JSON file
 * @param  {string} data
 */
function writeToJson(data) {
    fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
      if (err) throw err;
    });
  }


// deprecated delmc code
//   let filter = m => m.author.id === message.author.id
//   message.reply("Enter The Name of the Server You Want To Remove.", { fetchReply: true })
//   .then(() => {
//       message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
//       .then(collected => {
//           let name = collected.first().content //.replace(/\s+/g, "");
//           console.log(name);
//           if (Object.keys(data.Guilds[guildName].MCData.serverList).includes(name)){
//               delete data.Guilds[guildName].MCData.serverList[name];
              
//               writeToJson(data);
//               message.reply("Server Sucessfully Removed")
//           }
//           else message.reply("Invalid server name. Use !listmc to check list of registered servers")
//       })
//       .catch((error) => {
//           message.reply('Request timed out. Please try again.')
//       })
//   })
//   .catch(collected => {
//       console.log('Error');
//       message.reply('Request timed out. Please try again.')
//   });
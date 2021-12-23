const { MessageEmbed, MessageActionRow, MessageSelectMenu} = require('discord.js');
const data = require('../data.json');
const fs = require('fs');



module.exports = {
    name: 'changemc', 
    description: 'Changes Server that is Being Tracked', 
    async execute(client, message, args, guildName){

        let serverListSize = Object.values(data.Guilds[guildName].MCData.serverList).length 

        if (serverListSize == 0) {
            message.reply('No Registered Servers, use !addmc or !listmc to add servers.')
            return;
        }
        else if (serverListSize == 1) {
            message.reply('Only 1 Registered Server, use !addmc or !listmc to add more servers.')
            return;
        }

        // refresh dropdown menu options data to JSON
        for (let i = 0; i < 9; i++) {      // max of 10 trackable servers
            delete data.Guilds[guildName].MenuOptions[i];
            writeToJson(data);
        }

        for (let i = 0; i < serverListSize; i++) {
            var newJson = {
                label : Object.keys(data.Guilds[guildName].MCData.serverList)[i],
                description : Object.values(data.Guilds[guildName].MCData.serverList)[i],
                value : `selection${i}`
            }
            
            data.Guilds[guildName].MenuOptions[i] = newJson;
            writeToJson(data);
        }

        let label = [];
        let description = [];
        let value = [];
        let option = [];
        for (let i = 0; i < serverListSize; i++) {
            label[i] = JSON.stringify(data.Guilds[guildName].MenuOptions[i].label, null, 2).replace(/[""]/g, '')
            description[i] = JSON.stringify(data.Guilds[guildName].MenuOptions[i].description, null, 2).replace(/[""]/g, '')
            value[i] = JSON.stringify(data.Guilds[guildName].MenuOptions[i].value, null, 2).replace(/[""]/g, '')
            console.log(label[i]);
            console.log(description[i]);
            console.log(value[i]);
        }

        for (let i = 0; i < serverListSize; i++) {
            option[i] = ({label: label[i], description: description[i], value: value[i]})
        }
        console.log(option);
        
        const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('selection')
					.setPlaceholder('Nothing selected')
					.addOptions(option),
			);

        await message.reply({ content: 'Pong!', ephemeral: true, components: [row] });

        const filter = i =>  i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({max: 1, time: 15000 });
        const command = client.commands.get('mc');

        collector.on('collect', async i => {
            var selection = i.values[0]
            for (let i = 0; i < serverListSize; i++) {
                if(selection == `selection${i}`){
                    var newIP = description[i];
                    data.Guilds[guildName].MCData["selectedServer"] = newIP;
                    writeToJson(data);
                }  
            }

            if (i.customId === "selection") {
                await i.update({ content: 'Server Updated', components: [] });
                //await command.execute(client, message, args, guildName);
            }
        });
        
        collector.on('end', collected => console.log(`Collected ${collected.size} items`));
    }
}



function writeToJson(data) {
    fs.writeFile('./data.json', JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}
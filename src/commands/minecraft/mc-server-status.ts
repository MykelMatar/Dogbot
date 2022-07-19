import {Command} from "../../dependencies/classes/Command";
import {MessageActionRow, MessageButton, MessageEmbed} from "discord.js";
import {status} from "minecraft-server-util";
import {runMCButtonCollector} from "../../dependencies/helpers/runMCButtonCollector";

export const mcServerStatus = new Command(
    'mc-server-status',
    'retrieves status of selected MC server',
    async (client, interaction, guildName?) => {

        const MCServerData = mcServerStatus.guildData.MCServerData
        const serverList = MCServerData.serverList
        
        if (serverList.length === 0) {
            return interaction.editReply('No Registered Servers, use !addmc or !listmc to add servers.')
        }
        
        // retrieve title and IP from mongoDB
        let title = JSON.stringify(MCServerData.selectedServer.name)
        let MCServerIP = JSON.stringify(MCServerData.selectedServer.ip)
        
        let row; // variable amount of buttons to reflect doable actions
        if (serverList.length === 1) {
            row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('List')
                        .setLabel('Server List')
                        .setStyle('SECONDARY'),
                )
        } else {
            row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('Change')
                        .setLabel('Change')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('List')
                        .setLabel('Server List')
                        .setStyle('SECONDARY'),
                )
        }

        // Check Server Status
        const options = { timeout: 3000 }
        status(MCServerIP.replace(/"+/g, ''), 25565, options)
            .then(async (response) => {
                console.log('Server Online')
                
                const embed = new MessageEmbed()
                    .setTitle(title.replace(/["]+/g, ''))
                    .addFields(
                        {name: 'Server IP', value: `>  ${MCServerIP.replace(/["]+/g, '')}`},
                        {name: 'Modpack', value: `> ${response.motd.clean.toString()}`},
                        //`> [${response.motd.clean.toString()}](https://www.curseforge.com/minecraft/modpacks)`
                        {name: 'Version', value: `>  ${response.version.name.toString()}`},
                        {name: 'Online Players', value: `>  ${response.players.online.toString()}`},
                    )
                    .setColor("#8570C1")
                    .setFooter({text: 'Server Online'})

                // searched Player embed field 
                let searchedPlayer = interaction.options.data.find(option => option.name === 'username')
                let onlinePlayers = response.players.sample
                let foundPlayer = false;
                
                if (searchedPlayer !== undefined) {
                    onlinePlayers.forEach(player => {
                        if (player.name === searchedPlayer.value) {
                            embed.addField('Searched User', `>  ${player.name} is online`)
                            foundPlayer = true;
                        }
                    })
                    if (foundPlayer === false) {
                        embed.addField('Searched User', `>  ${searchedPlayer.value} is offline`)
                    }
                }

                await interaction.editReply({embeds: [embed], components: [row]})
                await runMCButtonCollector(client, interaction, guildName)
            })
            .catch(async () => {
                console.log('Server Offline')
                
                const embed = new MessageEmbed()
                    .setTitle(title.replace(/["]+/g, ''))
                    .addField("Server Offline", "all good")   // ? add cmd to change server offline interaction ?
                    .setColor("#8570C1")
                
                await interaction.editReply({embeds: [embed], components: [row]})
                await runMCButtonCollector(client, interaction, guildName)
            });
    })
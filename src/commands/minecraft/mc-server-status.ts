import {Command} from "../../dependencies/classes/Command";
import {MessageActionRow, MessageButton, MessageEmbed} from "discord.js";
import {status} from "minecraft-server-util";
import {runMCButtonCollector} from "../../dependencies/helpers/runMCButtonCollector";

export const mcServerStatus = new Command(
    'mc-server-status',
    'retrieves status of selected MC server',
    async (client, interaction, guildName?) => {

        const MCServerData = mcServerStatus.guildData.MCServerData

        // ensures command does not execute if 0 or 1 server exists
        if (MCServerData.serverList.length === 0) {
            return interaction.editReply('No Registered Servers, use !addmc or !listmc to add servers.')
        }

        // retrieve required JSON data
        let title = JSON.stringify(MCServerData.selectedServer.name)
        let MCServerIP = JSON.stringify(MCServerData.selectedServer.ip)

        // Generate buttons
        const row = new MessageActionRow()
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

        // Check Server Status
        const options = { timeout: 3000 }
        
        status(MCServerIP.replace(/["]+/g, ''), 25565, options) // port default is 25565
            .then(async (response) => {
                console.log('Server Online')

                // create Embed w/ server info (use console.log(response) for extra information about server)
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
                console.log({onlinePlayers})
                
                if (onlinePlayers === null)
                    console.log('no searched player')
                else if (searchedPlayer !== undefined) {
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

                // create embed to display server offline (its an embed to allow for editing during server info refresh)
                const embed = new MessageEmbed()
                    .setTitle(title.replace(/["]+/g, ''))
                    .addField("Server Offline", "all good")   // ? add cmd to change server offline interaction ?
                    .setColor("#8570C1")

                // send embed and collect response
                await interaction.editReply({embeds: [embed], components: [row]})
                await runMCButtonCollector(client, interaction, guildName)
            });
    })
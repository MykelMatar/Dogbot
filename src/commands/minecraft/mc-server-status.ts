import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, CommandInteraction, SlashCommandBuilder} from "discord.js";
import {status} from "minecraft-server-util";
import {runMCButtonCollector} from "../../dependencies/helpers/runMCButtonCollector";
import {newClient} from "../../dependencies/myTypes";

export const mcServerStatus = {
    data: new SlashCommandBuilder() 
        .setName('mc-server-status')
        .setDescription('Retrieves status of a selected MC server. Can also check if a user is online.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Who to check is online in the server')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display response or not')
                .setRequired(false)),
        
    async execute(client: newClient, interaction: CommandInteraction, guildData, guildName?: string){
        const MCServerData = guildData.MCServerData
        const serverList = MCServerData.serverList

        if (serverList.length === 0) {
            return interaction.editReply('No Registered Servers, use !addmc or !listmc to add servers.')
        }

        // retrieve title and IP from mongoDB
        let title = JSON.stringify(MCServerData.selectedServer.name)
        let MCServerIP = JSON.stringify(MCServerData.selectedServer.ip)

        let row; // variable amount of buttons to reflect doable actions
        if (serverList.length === 1) {
            row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('List')
                        .setLabel('Server List')
                        .setStyle(ButtonStyle.Secondary),
                )
        } else {
            row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('Change')
                        .setLabel('Change')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('List')
                        .setLabel('Server List')
                        .setStyle(ButtonStyle.Secondary),
                )
        }

        // Check Server Status
        const options = { timeout: 3000 }
        status(MCServerIP.replace(/"+/g, ''), 25565, options)
            .then(async (response) => {
                console.log('Server Online')

                const embed = new EmbedBuilder()
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
                            embed.addFields({name: 'Searched User',value: `>  ${player.name} is online`})
                            foundPlayer = true;
                        }
                    })
                    if (foundPlayer === false) {
                        embed.addFields({name: 'Searched User',value: `>  ${searchedPlayer.value} is offline`})
                    }
                }

                await interaction.editReply({embeds: [embed], components: [row]})
                await runMCButtonCollector(client, interaction, guildData, guildName)
            })
            .catch(async () => {
                console.log('Server Offline')

                const embed = new EmbedBuilder()
                    .setTitle(title.replace(/["]+/g, ''))
                    .addFields({name: 'Server Offline', value: 'all good'})
                    .setColor("#8570C1")

                await interaction.editReply({embeds: [embed], components: [row]})
                await runMCButtonCollector(client, interaction, guildData, guildName)
            });
    }
}
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    Message,
    SlashCommandBuilder
} from "discord.js";
import {status} from "minecraft-server-util";
import {McServerStatusCollector} from "../../dependencies/helpers/mcServerStatusCollector";
import {embedColor, GuildSchema, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";

export const mcServerStatus = {
    data: new SlashCommandBuilder()
        .setName('mc-server-status')
        .setDescription('Retrieves status of a selected MC server. Only supports Java Servers')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Check if a player is online')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display response or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema, guildName: string) {
        const MCServerData = guildData.MCServerData
        const serverList: object[] = MCServerData.serverList
        if (serverList.length === 0) {
            return interaction.editReply('*No Registered Servers, use !addmc or !listmc to add servers.*')
        }
        let title: string = JSON.stringify(MCServerData.selectedServer.name)
        let MCServerIP: string = JSON.stringify(MCServerData.selectedServer.ip)
        let MCServerPort: number = MCServerData.selectedServer.port

        let row: ActionRowBuilder<ButtonBuilder>
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

        const options = {timeout: 3000}
        status(MCServerIP.replace(/"+/g, ''), MCServerPort, options)
            .then(async (response) => {
                log.info('Server Online')

                const embed = new EmbedBuilder()
                    .setTitle(title.replace(/["]+/g, ''))
                    .addFields(
                        {name: 'Server IP', value: `>  ${MCServerIP.replace(/["]+/g, '')}`},
                        {name: 'Modpack', value: `> ${response.motd.clean.toString()}`},
                        {name: 'Version', value: `>  ${response.version.name.toString()}`},
                        {name: 'Online Players', value: `>  ${response.players.online.toString()}`},
                    )
                    .setColor(embedColor)
                    .setFooter({text: 'Server Online'})

                let searchedPlayer = interaction.options.data.find(option => option.name === 'username')
                let onlinePlayers = response.players.sample
                let foundPlayer = false;

                if (searchedPlayer !== undefined) {
                    onlinePlayers.forEach(player => {
                        if (player.name === searchedPlayer.value) {
                            embed.addFields({name: 'Searched User', value: `>  ${player.name} is online`})
                            foundPlayer = true;
                        }
                    })
                    if (foundPlayer === false) {
                        embed.addFields({name: 'Searched User', value: `>  ${searchedPlayer.value} is offline`})
                    }
                }

                let sent: Message = await interaction.editReply({embeds: [embed], components: [row]})
                await McServerStatusCollector(client, interaction, guildData, guildName, sent)
            })
            .catch(async () => {
                log.error('Server Offline')

                const embed = new EmbedBuilder()
                    .addFields({name: `${title.replace(/"+/g, '')} Offline`, value: '*all good*'})
                    .setColor(embedColor)

                let sent: Message = await interaction.editReply({embeds: [embed], components: [row]})
                await McServerStatusCollector(client, interaction, guildData, guildName, sent)
            });
    }
}
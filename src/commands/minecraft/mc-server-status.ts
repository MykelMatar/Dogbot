import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    CommandInteractionOption,
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
        const {serverList}: { serverList: object[] } = MCServerData;

        if (serverList.length === 0) {
            return interaction.editReply('*No Registered Servers, use /mc-add-server to add servers.*')
        }
        const {name, ip, port} = MCServerData.selectedServer;

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
                        .setLabel('Change Server')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('List')
                        .setLabel('Server List')
                        .setStyle(ButtonStyle.Primary),
                )
        }
        
        status(ip, port, {timeout: 3000})
            .then(async (response) => {
                log.info('Server Online')

                const embed = new EmbedBuilder()
                    .setTitle(name)
                    .addFields(
                        {name: 'Server IP', value: `>  ${ip}`},
                        {name: 'Modpack', value: `> ${response.motd.clean.toString()}`},
                        {name: 'Version', value: `>  ${response.version.name.toString()}`},
                        {name: 'Online Players', value: `>  ${response.players.online.toString()}`},
                    )
                    .setColor(embedColor)
                    .setFooter({text: 'Server Online'})

                const {value: searchedPlayer} = (interaction.options.data.find(option => option.name === 'username') ?? {}) as CommandInteractionOption;
                let onlinePlayers = response.players.sample
                let foundPlayer = false;

                if (searchedPlayer !== undefined) {
                    const player = onlinePlayers.find(player => player.name === searchedPlayer);
                    if (player !== undefined) {
                        embed.addFields({name: 'Searched User', value: `>  ${player.name} is online`});
                        foundPlayer = true;
                    }
                    if (!foundPlayer) {
                        embed.addFields({name: 'Searched User', value: `>  ${searchedPlayer} is offline`})
                    }
                }

                let sent: Message = await interaction.editReply({embeds: [embed], components: [row]})
                await McServerStatusCollector(client, interaction, guildData, guildName, sent)
            })
            .catch(async () => {
                log.error('Server Offline')

                const embed = new EmbedBuilder()
                    .addFields({name: `${name} Offline`, value: '*all good, try going outside*'})
                    .setColor(embedColor)

                let sent: Message = await interaction.editReply({embeds: [embed], components: [row]})
                await McServerStatusCollector(client, interaction, guildData, guildName, sent)
            });
    }
}
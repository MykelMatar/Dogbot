import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    Message,
    SlashCommandBuilder
} from "discord.js";
import {status, statusBedrock} from "minecraft-server-util";
import {McServerStatusCollector} from "../../dependencies/helpers/mcServerStatusCollector";
import {embedColor, IGuild, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";

export const mcServerStatus = {
    data: new SlashCommandBuilder()
        .setName('mc-server-status')
        .setDescription('Retrieves status of a selected MC server. Only supports Java Servers')
        .addStringOption(option =>
            option.setName('search-user')
                .setDescription('Check if a player is online. This probably wont work on big server like Hypixel')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('IP of the server to check')
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('port')
                .setDescription('Server port. Default is 25565')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display response or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild): Promise<void | Message> {
        const MCServerData = guildData.mcServerData
        const {serverList}: { serverList: object[] } = MCServerData;

        if (serverList.length === 0) {
            return interaction.editReply('*No Registered Servers, use /mc-add-server to add servers.*')
        }

        const {value: searchedPlayer} = interaction.options.data.find(option => option.name === 'search-user') ?? {};

        const ipOption = interaction.options.data.find(option => option.name === 'ip')
        const portOption = interaction.options.data.find(option => option.name === 'port')
        let ip, port, name
        if (ipOption) {
            name = 'Server Status'
            ip = ipOption.value
            if (portOption) {
                port = portOption.value
            } else {
                port = 25565
            }
        } else if (!ipOption && portOption) {
            await interaction.editReply({content: 'invalid ip'})
        } else {
            name = MCServerData.selectedServer.name
            ip = MCServerData.selectedServer.ip
            port = MCServerData.selectedServer.port
        }


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

        try {
            let javaResponse = await status(ip, port, {timeout: 3000})

            const embed = new EmbedBuilder()
                .setTitle(name)
                .addFields(
                    {name: 'Server IP', value: `>  ${ip}`},
                    {name: 'Modpack', value: `> ${javaResponse.motd.clean.toString()}`},
                    {name: 'Version', value: `> ${javaResponse.version.name.toString()} - Java Edition`},
                    {name: 'Online Players', value: `>  ${javaResponse.players.online.toString()}`, inline: true},
                )
                .setColor(embedColor)
                .setFooter({text: 'Server Online'})

            if (searchedPlayer) {
                const isOnline = javaResponse.players.sample.some(player => {
                    if (player.name === searchedPlayer) {
                        embed.addFields({name: 'Searched User', value: `>  ${player.name} is online`, inline: true});
                        return true;
                    }
                    return false;
                });

                if (!isOnline) {
                    embed.addFields({name: 'Searched User', value: `>  ${searchedPlayer} is offline`, inline: true});
                }
            }

            let sent: Message = await interaction.editReply({embeds: [embed], components: [row]})
            await McServerStatusCollector(client, interaction, guildData, sent)

        } catch {
            try {
                log.info('java response failed, checking bedrock...')
                let bedrockResponse = await statusBedrock(ip, port, {timeout: 3000})

                const embed = new EmbedBuilder()
                    .setTitle(name)
                    .addFields(
                        {name: 'Server IP', value: `>  ${ip}`},
                        {name: 'Modpack', value: `> ${bedrockResponse.motd.clean.toString()}`},
                        {name: 'Version', value: `> ${bedrockResponse.version.name.toString()} - Bedrock Edition`},
                        {
                            name: 'Online Players',
                            value: `>  ${bedrockResponse.players.online.toString()}`,
                            inline: true
                        },
                    )
                    .setColor(embedColor)
                    .setFooter({text: 'Server Online'})

                let content: string = searchedPlayer ? 'cannot search for players on bedrock server' : '';
                let sent: Message = await interaction.editReply({content: content, embeds: [embed], components: [row]})

                await McServerStatusCollector(client, interaction, guildData, sent)
            } catch {
                log.error('Server Offline')

                const embed = new EmbedBuilder()
                    .addFields({name: `${name} Offline`, value: '*all good, try going outside*'})
                    .setColor(embedColor)

                let sent: Message = await interaction.editReply({embeds: [embed], components: [row]})
                await McServerStatusCollector(client, interaction, guildData, sent)
            }
        }
    }
}
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    Message,
    SlashCommandBuilder
} from "discord.js";
import {status, statusBedrock} from "minecraft-server-util";
import {statusButtonCollector} from "../../dependencies/helpers/mcHelpers/statusButtonCollector";
import {embedColor, IGuild, MinecraftServer, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/constants/logger";

export const mcStatus = {
    data: new SlashCommandBuilder()
        .setName('mc-status')
        .setDescription('Retrieves status of a minecraft server. Set using /mc-select-server or to input your own')
        .addStringOption(option =>
            option.setName('search-user')
                .setDescription('Check if a player is online. This probably wont work on big server like Hypixel')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('IP of the server to check')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('port')
                .setDescription('Server port. Default is 25565')
                .setRequired(false)
                .setMaxValue(65535))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display response or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: IGuild, listButton?: boolean): Promise<void | Message> {
        const MCServerData = guildData.mcServerData
        const {serverList}: { serverList: MinecraftServer[] } = MCServerData;

        if (serverList.length === 0) {
            return interaction.editReply('No Registered Servers, use **/mc-add-server** to add servers.')
        }

        const options = interaction.options as CommandInteractionOptionResolver;
        const searchedPlayer = options.getString('search-user')
        let ip = options.getString('ip')
        let port = options.getInteger('port')

        let name
        if (ip) {
            name = 'Server Status'
            port = !port ? 25565 : port
        } else if (!ip && port) {
            await interaction.editReply({content: 'Cannot have a port without an ip. How would I even find that server?'})
        } else {
            name = MCServerData.selectedServer.name
            ip = MCServerData.selectedServer.ip
            port = MCServerData.selectedServer.port
        }

        const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Change')
                    .setLabel('Change Server')
                    .setStyle(ButtonStyle.Primary),
            )

        let embed
        try {
            const javaResponse = await status(ip, port, {timeout: 3000})

            embed = new EmbedBuilder()
                .setTitle(name)
                .addFields(
                    {name: 'Server IP', value: `>  ${ip}`},
                    {name: 'Modpack', value: `> ${javaResponse.motd.clean.toString()}`},
                    {name: 'Version', value: `> Java Edition\n> ${javaResponse.version.name.toString()}`},
                    {name: 'Online Players', value: `>  ${javaResponse.players.online.toString()}`, inline: true},
                )
                .setColor(embedColor)
                .setFooter({text: 'Server Online'})

            if (searchedPlayer) {
                javaResponse.players.sample.some(player => {
                    const sanitizedPlayerName = player.name.toLowerCase().replace(/\s/g, "")
                    if (sanitizedPlayerName === searchedPlayer.toLowerCase().replace(/\s/g, "")) {
                        embed.addFields({name: 'Searched User', value: `>  ${player.name} is online`, inline: true});
                    } else {
                        embed.addFields({
                            name: 'Searched User',
                            value: `>  ${searchedPlayer} is offline`,
                            inline: true
                        });
                    }
                });
            }
        } catch {
            try {
                log.warn('java response failed, checking bedrock...')
                let bedrockResponse = await statusBedrock(ip, port, {timeout: 3000})

                embed = new EmbedBuilder()
                    .setTitle(name)
                    .addFields(
                        {name: 'Server IP', value: `>  ${ip}`},
                        {name: 'Modpack', value: `> ${bedrockResponse.motd.clean.toString()}`},
                        {name: 'Version', value: `> Bedrock Edition\n> ${bedrockResponse.version.name.toString()}`},
                        {
                            name: 'Online Players',
                            value: `>  ${bedrockResponse.players.online.toString()}`,
                            inline: true
                        },
                    )
                    .setColor(embedColor)
                    .setFooter({text: 'Server Online. Note: Cannot search for players on bedrock servers'})
            } catch {
                log.warn('Server Offline')

                embed = new EmbedBuilder()
                    .addFields({name: `${name} Offline`, value: '*all good, try going outside*'})
                    .setColor(embedColor)
            }
        }
        if (listButton) {
            return interaction.editReply({content: 'now tracking new server'})
        }
        let sent: Message
        if (serverList.length > 1) {
            sent = await interaction.editReply({embeds: [embed], components: [row]})
        } else {
            sent = await interaction.editReply({embeds: [embed]})
        }
        await statusButtonCollector(client, interaction, guildData, sent)
    }
}
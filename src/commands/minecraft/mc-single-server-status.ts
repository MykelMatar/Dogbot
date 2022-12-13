import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    CommandInteractionOption,
    ComponentType,
    EmbedBuilder,
    Message,
    SlashCommandBuilder,
} from "discord.js";
import {status, statusBedrock} from "minecraft-server-util";
import {embedColor, MinecraftServer, NewClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {terminationListener} from "../../dependencies/helpers/terminationListener";

export const mcSingleServerStatus = {
    data: new SlashCommandBuilder()
        .setName('mc-single-server-stats')
        .setDescription('Get the status of a mc server not registered in the list. Supports Java and Bedrock servers.')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('IP of the server to check')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('port')
                .setDescription('Server port. Default is 25565')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display response or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData): Promise<void> {
        let server: MinecraftServer = {
            name: undefined,
            ip: undefined,
            port: undefined
        };
        let portOption: CommandInteractionOption = (interaction.options.data.find(option => option.name === 'port'));
        if (portOption === undefined) {
            server.port = 25565
        } else {
            server.port = portOption.value as number
        }
        server.ip = interaction.options.data[0].value as string

        const options = {timeout: 3000}
        status(server.ip, server.port, options)
            .then(async (response) => {
                log.info('Server Online')

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('SingleAdd')
                            .setLabel('Add To List')
                            .setStyle(ButtonStyle.Primary),
                    );

                const embed = new EmbedBuilder()
                    .addFields(
                        {name: 'Server IP', value: `>  ${server.ip}`},
                        {name: 'Description', value: `> ${response.motd.clean.toString()}`},
                        {name: 'Version', value: `> Java Edition - ${response.version.name.toString()}`},
                        {name: 'Online Players', value: `>  ${response.players.online.toString()}`},
                    )
                    .setColor(embedColor)
                    .setFooter({text: 'Server Online'})

                const serverList = guildData.MCServerData.serverList
                if (serverList.length === 10 || serverList.some(servers => servers["ip"] === server.ip)) {
                    return interaction.editReply({embeds: [embed]})
                } else {
                    var statusMessage: Message = await interaction.editReply({embeds: [embed], components: [row]})
                }

                const filter = i => i.user.id === interaction.member.user.id;
                const collector = interaction.channel.createMessageComponentCollector({
                    filter,
                    componentType: ComponentType.Button,
                    time: 10000
                });

                collector.on('collect', async i => {
                    if (i.message.id != statusMessage.id) return
                    if (i.customId === 'SingleAdd') {
                        await i.update({
                            embeds: [embed],
                            content: 'Adding Server',
                            components: []
                        });
                        serverList.push(server);
                        await guildData.save();
                        collector.stop()
                    }
                });

                collector.on('end', async collected => {
                    if (collected.size === 0)
                        await interaction.editReply({
                            embeds: [embed],
                            components: []
                        })
                    else if (collected.first().customId === 'SingleAdd')
                        await interaction.editReply({
                            content: 'Server added successfully',
                            embeds: [embed],
                            components: []
                        })
                });

                let terminate: boolean = false
                await terminationListener(client, collector, terminate)
            })
            .catch(async () => {
                statusBedrock(server.ip, server.port, options)
                    .then(async response => {
                        log.info('Server Online')

                        const embed = new EmbedBuilder()
                            .addFields(
                                {name: 'Server IP', value: `>  ${server.ip}`},
                                {name: 'Edition', value: `>  ${response.edition}`},
                                {name: 'Description', value: `> ${response.motd.clean.toString()}`},
                                {name: 'Version', value: `> Bedrock Edition - ${response.version.name.toString()}`},
                                {name: 'Online Players', value: `>  ${response.players.online.toString()}`},
                            )
                            .setColor('#B8CAD1')
                            .setFooter({text: 'Server Online'})

                        return interaction.editReply({embeds: [embed]})
                    })
                    .catch(async () => {
                        log.error('Server Offline')

                        const embed = new EmbedBuilder()
                            .addFields({name: 'Server Offline', value: '*all good, try going outside*'})
                            .setColor(embedColor)

                        await interaction.editReply({embeds: [embed]})
                    })
            })
    }
}
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    CommandInteraction,
    SlashCommandBuilder, CommandInteractionOption, Message,
} from "discord.js";
import {status, statusBedrock} from "minecraft-server-util";
import {MinecraftServer, newClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {McSingleServerCollector} from "../../dependencies/helpers/mcSingleServerCollector";

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

    async execute(client: newClient, interaction: CommandInteraction, guildData) {
        const serverList = guildData.MCServerData.serverList
        
        let server: MinecraftServer = { // setup object to push to mongoDB
            name: undefined, 
            ip: undefined, 
            port: undefined
        }; 
        let portOption: CommandInteractionOption = (interaction.options.data.find(option => option.name === 'port'));
        if (portOption === undefined) {
            server.port = 25565
        } else server.port = portOption.value as number // value is guaranteed to be number

        server.ip = interaction.options.data[0].value as string; // value is guaranteed to be string
        const options = {timeout: 3000}
        
        status(server.ip, server.port, options)
            .then(async (response) => {
                log.info('Server Online')

                // Generate buttons
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
                    .setColor('#B8CAD1')
                    .setFooter({text: 'Server Online'})
                
                // give button to add server only if server list is not full
                let sent: Message
                if (serverList.length === 10 || serverList.some(ipList => ipList["ip"] === server.ip)) {
                    return interaction.editReply({embeds: [embed]})
                } else {
                    sent = await interaction.editReply({embeds: [embed], components: [row]})
                }
                await McSingleServerCollector(client, interaction, embed, server, guildData, sent)
            })
            .catch(async () => {
                // check if server is Bedrock 
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
                            .setColor('#B8CAD1')

                        await interaction.editReply({embeds: [embed]})
                    })
            })
    }
}
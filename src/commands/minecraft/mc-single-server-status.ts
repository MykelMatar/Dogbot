import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    CommandInteraction,
    SlashCommandBuilder, CommandInteractionOption,
} from "discord.js";
import {status, statusBedrock} from "minecraft-server-util";
import {newClient} from "../../dependencies/myTypes";
import {log} from "../../dependencies/logger";
import {singleStatusCollectResponse} from "../../dependencies/helpers/singleStatusCollectResponse";

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

        // Generate buttons
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('SingleAdd')
                    .setLabel('Add To List')
                    .setStyle(ButtonStyle.Primary),
            )

        let portOption: CommandInteractionOption = (interaction.options.data.find(option => option.name === 'port'));
        let port: number
        if (portOption === undefined) {
            port = 25565
        } else port = portOption.value as number // value is guaranteed to be number

        let ip = interaction.options.data[0].value as string; // value is guaranteed to be string
        const options = {timeout: 3000}
        let server = {name: ip, ip: ip, port: port}; // setup variable to push to mongo
        
        status(ip, port, options)
            .then(async (response) => {
                log.info('Server Online')

                const embed = new EmbedBuilder()
                    .addFields(
                        {name: 'Server IP', value: `>  ${ip}`},
                        {name: 'Description', value: `> ${response.motd.clean.toString()}`},
                        {name: 'Version', value: `> Java Edition - ${response.version.name.toString()}`},
                        {name: 'Online Players', value: `>  ${response.players.online.toString()}`},
                    )
                    .setColor('#B8CAD1')
                    .setFooter({text: 'Server Online'})

                // give button to add server only if server list is not full
                if (serverList.length === 10 || serverList.some(o => o["ip"] === ip)) {
                    return interaction.editReply({embeds: [embed]})
                } else {
                    await interaction.editReply({embeds: [embed], components: [row]})
                }
                
                await singleStatusCollectResponse(client, interaction, embed, server, guildData)
            })
            .catch(async () => {
                // check if server is Bedrock 
                statusBedrock(ip, port, options)
                    .then(async response => {
                        log.info('Server Online')

                        // create Embed w/ server info (use console.log(response) for extra information about server)
                        const embed = new EmbedBuilder()
                            .addFields(
                                {name: 'Server IP', value: `>  ${ip}`},
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
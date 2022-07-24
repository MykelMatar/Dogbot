import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    CommandInteraction,
    SlashCommandBuilder
} from "discord.js";
import {status} from "minecraft-server-util";
import {newClient} from "../../dependencies/myTypes";
import {log} from "../../dependencies/logger";

export const mcSingleServerStatus = {
    data: new SlashCommandBuilder()
        .setName('mc-single-server-stats')
        .setDescription('Get the status of a mc server not registered in the list')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('IP of the server to check')
                .setRequired(true))
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

        let ip = interaction.options.data[0].value;
        const options = {timeout: 3000}

        status(ip.toString(), 25565, options)
            .then(async (response) => {
                log.info('Server Online')

                // create Embed w/ server info (use console.log(response) for extra information about server)
                const embed = new EmbedBuilder()
                    .setTitle('Server Status')
                    .addFields(
                        {name: 'Server IP', value: `>  ${ip}`},
                        {name: 'Modpack', value: `> ${response.motd.clean.toString()}`},
                        {name: 'Version', value: `>  ${response.version.name.toString()}`},
                        {name: 'Online Players', value: `>  ${response.players.online.toString()}`},
                    )
                    .setColor('#B8CAD1')
                    .setFooter({text: 'Server Online'})

                if (serverList.length === 10 || serverList.some(o => o["ip"] === ip)) {
                    return interaction.editReply({embeds: [embed]})
                } else {
                    await interaction.editReply({embeds: [embed], components: [row]})
                }

                let server = {name: ip, ip: ip}; // setup variable to push to mongo

                // create collector
                const filter = i => i.user.id === interaction.member.user.id;
                const collector = interaction.channel.createMessageComponentCollector({
                    filter,
                    componentType: ComponentType.Button,
                    time: 10000
                }); // only message author can interact, 10s timer

                // collect response
                collector.on('collect', async i => {
                    // interaction handling
                    if (i.customId === 'SingleAdd') {
                        await i.update({embeds: [embed], content: 'Adding Server (if possible)', components: []});
                        serverList.push(server);
                        await guildData.save();
                        collector.stop()
                    }
                });

                collector.on('end', async collected => {
                    if (collected.size === 0)
                        await interaction.editReply({embeds: [embed], components: []}) // remove buttons & embed
                    else if (collected.first().customId === 'SingleAdd')
                        await interaction.editReply({
                            content: 'server added successfully',
                            embeds: [embed],
                            components: []
                        })   // remove buttons & embed
                });
            })
            .catch(async () => {
                log.error('Server Offline')

                // create embed to display server offline (its an embed to allow for editing during server info refresh)
                const embed = new EmbedBuilder()
                    .setTitle('Server Status')
                    .addFields({name: 'Server Offline', value: 'all good'})
                    .setColor('#B8CAD1')

                // send embed and collect response
                await interaction.editReply({embeds: [embed]})
            })
    }
}
import {Command} from "../../dependencies/classes/Command";
import {MessageActionRow, MessageButton, MessageEmbed} from "discord.js";
import {status} from "minecraft-server-util";

export const mcSingleServerStatus = new Command(
    'mc-single-server-status',
    'get the status of a mc server 1 time (quick check)',
    async (client, interaction) => {

        const serverList = mcSingleServerStatus.guildData.MCServerData.serverList
        
        // Generate buttons
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('SingleAdd')
                    .setLabel('Add To List')
                    .setStyle('PRIMARY'),
            )
        
        let ip = interaction.options.data[0].value;
        const options = { timeout: 3000 }
        
        status(ip.toString(), 25565, options)
            .then(async (response) => {
                console.log('server online')

                // create Embed w/ server info (use console.log(response) for extra information about server)
                const embed = new MessageEmbed()
                    .setTitle('Server Status')
                    .addFields(
                        {name: 'Server IP', value: `>  ${ip}`},
                        {name: 'Modpack', value: `> ${response.motd.clean.toString()}`},
                        {name: 'Version', value: `>  ${response.version.name.toString()}`},
                        {name: 'Online Players', value: `>  ${response.players.online.toString()}`},
                    )
                    .setColor("#8570C1")
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
                    componentType: 'BUTTON',
                    time: 10000
                }); // only message author can interact, 10s timer

                // collect response
                collector.on('collect', async i => {
                    // interaction handling
                    if (i.customId === 'SingleAdd') {
                        await i.update({embeds: [embed], content: 'Adding Server (if possible)', components: []});
                        serverList.push(server);
                        await mcSingleServerStatus.guildData.save();
                        collector.stop()
                    }
                });

                collector.on('end', async collected => {
                    if (collected.size === 0)
                        await interaction.editReply({embeds: [embed], components: []}) // remove buttons & embed
                    else if (collected.first().customId === 'SingleAdd')
                        await interaction.editReply({content: 'server added successfully', embeds: [embed], components: []})   // remove buttons & embed
                });
        })
            .catch(async () => {
                console.log('Server Offline')

                // create embed to display server offline (its an embed to allow for editing during server info refresh)
                const embed = new MessageEmbed()
                    .setTitle('Server Status')
                    .addField("Server Offline", "all good")   // ? add cmd to change server offline interaction ?
                    .setColor("#8570C1")

                // send embed and collect response
                await interaction.editReply({embeds: [embed]})
            })
        
    }
)
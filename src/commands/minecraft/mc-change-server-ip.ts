import {MessageActionRow, MessageSelectMenu} from "discord.js";
import {status} from "minecraft-server-util";
import {Category, Command} from "../../dependencies/classes/Command";
import {generateMCMenuOptions} from "../../dependencies/helpers/generateMCMenuOptions";


export const mcChangeServerIP = new Command(
    'mc-change-server-ip',
    'changes IP of registered server',
    async (client, interaction, guildName?) => {

        const MCServerData = mcChangeServerIP.guildData.MCServerData
        let serverListSize = MCServerData.serverList.length

        // make sure there is at least 1 server
        if (serverListSize === 0) {
            await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
            return ;
        }

        // retrieve server IP from user input
        let ip = interaction.options._hoistedOptions[0].value

        // verify that IP is not already registered
        if (MCServerData.serverList.some(function (o) {
            return o["ip"] === ip;
        })) {
            await interaction.editReply(
                "Server already registered, double check the IP or use **!renamemc** to change the name"
            );
            return console.log("Duplicate IP Detected");
        }

        // make sure IP is a valid server IP by checking its status (server must be online for this to work)
        try {
            await status(ip)
        } catch (error) {
            await interaction.editReply('Could not retrieve server status. Double check IP and make sure server is online.')
            console.log('Invalid Server IP / Server Offline');
        }

        // create variables and generate options for select menu
        let options: any[];
        options = await generateMCMenuOptions(interaction, guildName, serverListSize);

        // generate select menu
        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('change-ip-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(options[0]),
            );

        // send embed
        await interaction.editReply({
            ephemeral: true,
            content: 'Select the server you want to change the IP of',
            components: [row]
        });

        // Response collection and handling
        let filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'SELECT_MENU',
            max: 1,
            time: 10000
        });
        let serverName;

        collector.on('collect', async i => {
            if (i.customId !== 'change-ip-menu') return collector.stop()
            // find selection and replace corresponding ip in mongo
            for (let j = 0; j < serverListSize; j++) {
                if (i.values[0] === `selection${j}`) {
                    MCServerData.serverList[j].ip = ip
                    serverName = MCServerData.serverList[j].name
                }
            }
            await mcChangeServerIP.guildData.save() // save changes to mongo
            collector.stop()
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Request Timeout',
                    components: []
                });
                console.log('Request Timeout')
            }
            else if (collected.first().customId !== 'change-ip-menu') {
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Avoid using multiple commands at once',
                    components: []
                });
                console.log('Command Collision Detected')
            }
            else if (collected.first().customId === 'change-ip-menu') {
                await interaction.editReply({
                    content: serverName + ' IP changed successfully',
                    ephemeral: true,
                    components: []
                });
                console.log('Server IP changed Successfully')
            }
        });

    }
)

mcChangeServerIP.requiresAdmin = true;
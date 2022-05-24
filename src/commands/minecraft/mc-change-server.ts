import {Category, Command} from "../../dependencies/classes/Command";
import {generateMCMenuOptions} from "../../dependencies/helpers/generateMCMenuOptions";
import {MessageActionRow, MessageSelectMenu} from "discord.js";

export const mcChangeServer = new Command(
    'mc-change-server',
    'changes server being tracked by mc-server-status',
    async (client, interaction, guildName?) => {
        
        const MCServerData = mcChangeServer.guildData.MCServerData
        let serverListSize = MCServerData.serverList.length

        // make sure there are at least 2 servers
        if (serverListSize === 0) {
            await interaction.editReply('No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.')
            return;
        } else if (serverListSize === 1) {
            await interaction.editReply('Only 1 Registered Server, use /mc-add-server or /mc-list-servers to add more servers.')
            return;
        }

        // create variables and generate options for select menu
        let options = await generateMCMenuOptions(interaction, guildName, serverListSize);
        let option = options[0];
        let label = options[1];
        let description = options[3]

        // generate select menu
        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('change-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(option),
            );

        // send embed and store in variable to edit later
        await interaction.editReply({content: 'Select a Different Server to Check', components: [row], embeds: []});

        // Response collection and handling
        const filter = i => i.user.id === interaction.member.user.id
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'SELECT_MENU',
            time: 15000
        });

        collector.on('collect', async i => {
            // find user selection and change mongo doc info
            if (i.customId !== 'change-menu') return collector.stop()
            for (let j = 0; j < serverListSize; j++) {
                if (i.values[0] === `selection${j}`) {
                    MCServerData.selectedServer.name = label[j];
                    MCServerData.selectedServer.ip = description[j];
                }
            }
            await mcChangeServer.guildData.save() // write to mongo
            collector.stop()
        });

        // check whether a user responded or not, and edit embed accordingly
        collector.on('end', async collected => {
            if (collected.size === 0)
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Request Timeout',
                    components: []
                })
            else if (collected.first().customId !== 'change-menu')
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Avoid using multiple commands at once',
                    components: []
                })
            else if (collected.first().customId === 'change-menu') {
                await interaction.editReply({
                    ephemeral: true,
                    content: `Server Updated, now Tracking ${MCServerData.selectedServer.name}. Retrieving server status...`,
                    components: []
                })
                await client.commands.get('mc-server-status').execute(client, interaction, guildName);
            }
        });
    }
)
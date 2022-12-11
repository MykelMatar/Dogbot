import {
    ActionRowBuilder,
    CommandInteraction,
    CommandInteractionOption,
    ComponentType,
    Message,
    PermissionFlagsBits,
    SelectMenuBuilder,
    SlashCommandBuilder
} from "discord.js";
import {status} from "minecraft-server-util";
import {McMenuOptionGenerator} from "../../dependencies/helpers/mcMenuOptionGenerator";
import {MenuGeneratorReturnValues, MinecraftServer, newClient} from "../../dependencies/myTypes";
import log from "../../dependencies/logger";
import {terminationListener} from "../../dependencies/helpers/terminationListener";

export const mcChangeServerIP = {
    data: new SlashCommandBuilder()
        .setName('mc-change-server-ip')
        .setDescription('Changes the IP address of an existing server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('new-ip')
                .setDescription('the new IP address')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('new-port')
                .setDescription('the new port')
                .setRequired(false)),

    async execute(client: newClient, interaction: CommandInteraction, guildData, guildName: string) {
        const MCServerData = guildData.MCServerData
        let serverListSize: number = MCServerData.serverList.length

        // make sure there is at least 1 server
        if (serverListSize === 0) {
            await interaction.editReply('*No Registered Servers, use /mc-add-server or /mc-list-servers to add servers.*')
            return;
        }

        // retrieve server info
        let server: MinecraftServer = { // setup object to push to mongoDB
            name: undefined,
            ip: interaction.options.data[0].value as string,
            port: undefined
        };
        let portOption: CommandInteractionOption = (interaction.options.data.find(option => option.name === 'port'));
        if (portOption === undefined) {
            server.port = 25565
        } else server.port = portOption.value as number // value is guaranteed to be number

        // verify that IP is not already registered
        if (MCServerData.serverList.some(server => server["ip"] === server.ip)) {
            await interaction.editReply(
                "*Server already registered, double check the IP or use **!renamemc** to change the name*"
            );
            return log.error("Duplicate IP Detected");
        }

        // validate server status
        try {
            await status(server.ip, server.port)
        } catch (error) {
            await interaction.editReply('*Could not retrieve server status. Double check IP and make sure server is online.*')
            log.error('Invalid Server IP / Server Offline');
        }

        // create variables and generate options for select menu
        let optionGenerator: MenuGeneratorReturnValues = await McMenuOptionGenerator(interaction, guildName, serverListSize);

        // generate select menu
        let row = new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('change-ip-menu')
                    .setPlaceholder('Nothing selected')
                    .addOptions(optionGenerator.optionsArray),
            );

        // send embed
        let sent: Message = await interaction.editReply({
            content: 'Select the server you want to change the IP of',
            components: [row]
        });

        // Response collection and handling
        let filter = i => i.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.SelectMenu,
            max: 1,
            time: 10000
        });

        let serverName;
        collector.on('collect', async i => {
            if (i.message.id != sent.id) return
            if (i.customId !== 'change-ip-menu') return collector.stop()
            // find selection and replace corresponding ip in mongo
            for (let j = 0; j < serverListSize; j++) {
                if (i.values[0] === `selection${j}`) {
                    MCServerData.serverList[j].ip = server.ip
                    MCServerData.serverList[j].port = server.port
                    serverName = MCServerData.serverList[j].name
                }
            }
            await guildData.save() // save changes to mongo
            collector.stop()
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({content: '*Request Timeout*', components: []});
                log.error('Request Timeout')
            } else if (collected.first().customId !== 'change-ip-menu') {
                await interaction.editReply({content: '*Avoid using multiple commands at once*', components: []});
                log.error('Command Collision Detected')
            } else if (collected.first().customId === 'change-ip-menu') {
                await interaction.editReply({content: `**${serverName}**  IP changed successfully`, components: []});
                log.info('Server IP changed Successfully')
            }
        });

        let terminate: boolean = false
        await terminationListener(client, collector, terminate)
    }
}

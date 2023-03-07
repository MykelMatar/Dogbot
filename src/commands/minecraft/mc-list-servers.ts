import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    CommandInteractionOption,
    ComponentType,
    EmbedBuilder,
    Message,
    SlashCommandBuilder
} from "discord.js";
import {embedColor, GuildSchema, NewClient} from "../../dependencies/myTypes";
import {
    removeTerminationListener,
    terminate,
    terminationListener
} from "../../dependencies/helpers/terminationListener";
import {status, statusBedrock} from "minecraft-server-util";

//TODO check add server button, might not be working
export const mcListServers = {
    data: new SlashCommandBuilder()
        .setName('mc-list-servers')
        .setDescription('Lists all registered MC servers')
        .addBooleanOption(option =>
            option.setName('get-status')
                .setDescription('Retrieves the status of every server on the list. This may take a while...')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display the leaderboard or not')
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema, guildName: string) {
        const MCServerData = guildData.MCServerData

        let serverStatusList: string[] = []
        let {value: getStatus} = (interaction.options.data.find(option => option.name === 'get-status') ?? {}) as CommandInteractionOption

        let serverNameList: string[] = MCServerData.serverList.map(server => server.name);
        let serverIPList: string[] = MCServerData.serverList.map(server => server.ip);

        if (getStatus) {
            const statusPromises = MCServerData.serverList.map(MCServer => {
                return status(MCServer.ip, MCServer.port, {timeout: 2000})
                    .then(() => '*Online*')
                    .catch(() =>
                        statusBedrock(MCServer.ip, MCServer.port, {timeout: 2000})
                            .then(() => '*Online*')
                            .catch(() => '*Offline*'));
            });
            const statusResults = await Promise.all(statusPromises);
            serverStatusList = [...statusResults];
        }
        
        if (serverIPList.length === 0) { // using server IP List ensures a nameless IP is not overwritten
            serverNameList = ["N/A"]
            serverIPList = ["N/A"]
        }

        let row; // variable amount of buttons to reflect doable actions
        if (serverIPList.length === 10) {
            row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ListRemove')
                        .setLabel('Remove')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('ListChange')
                        .setLabel('Change')
                        .setStyle(ButtonStyle.Primary),
                );
        } else if (serverIPList.length === 1) {
            row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ListAdd')
                        .setLabel('Add')
                        .setStyle(ButtonStyle.Success),
                );
        } else {
            row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ListAdd')
                        .setLabel('Add')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('ListRemove')
                        .setLabel('Remove')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('ListChange')
                        .setLabel('Change')
                        .setStyle(ButtonStyle.Primary),
                );
        }

        const embed = new EmbedBuilder()
            .setTitle('Registered MC Servers')
            .addFields(
                {name: 'Server Name', value: serverNameList.join(' \n'), inline: true},
                {name: 'IP', value: serverIPList.join(' \n '), inline: true},
            )
            .setColor(embedColor)
            .setFooter({text: MCServerData.serverList.length + ' / 10 Servers Registered'})

        if (getStatus) {
            embed.addFields({name: 'Status', value: serverStatusList.join(' \n '), inline: true})
        }

        const sent: Message = await interaction.editReply({embeds: [embed], components: [row]})

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000,
            filter: (i) => {
                if (i.user.id !== interaction.member.user.id) return false;
                return i.message.id === sent.id;
            },
        });
        const terminateBound = terminate.bind(null, client, collector)
        await terminationListener(client, collector, terminateBound)

        const command1 = client.commands.get('mc-add-server');
        const command2 = client.commands.get('mc-delete-server');
        const command3 = client.commands.get('mc-change-server');

        collector.on('collect', async i => {
            let update, execute;
            if (i.customId === 'ListAdd') {
                update = i.update({embeds: [], content: '*Adding Server...*', components: []});
                execute = command1.execute(client, interaction, guildData, guildName);
            } else if (i.customId === 'ListRemove') {
                update = i.update({embeds: [], content: '*Removing Server...*', components: []});
                execute = command2.execute(client, interaction, guildData, guildName);
            } else if (i.customId === 'ListChange') {
                update = i.update({content: '*Changing Server...*', components: []});
                execute = command3.execute(client, interaction, guildData, guildName);
                collector.stop()
            }
            await Promise.all([update, execute])
        });

        collector.on('end', async collected => {
            removeTerminationListener(terminateBound)
            if (collected.size === 0)
                await interaction.editReply({embeds: [embed], components: []}) // remove buttons & embed
            else if (collected.first().customId === 'ListAdd' || collected.first().customId === 'ListRemove' || collected.first().customId === 'ListChange')
                await interaction.editReply({embeds: [], components: []})   // remove buttons & embed
        });

    }
}
import {CommandInteraction, ComponentType, Message} from "discord.js";
import {NewClient} from "../myTypes";
import {removeTerminationListener, terminate, terminationListener} from "./terminationListener";

/**
 * button collector for mc-server-status command. In a seperate function because it is used twice and writing
 * it twice looks dumb
 *
 * @param client
 * @param interaction
 * @param guildData
 * @param statusPrompt
 */
export async function McServerStatusCollector(client: NewClient, interaction: CommandInteraction, guildData, statusPrompt: Message) {

    const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
        max: 1,
        filter: i => {
            if (i.user.id !== interaction.member.user.id) return false;
            return i.message.id === statusPrompt.id
        }
    });
    let terminateBound = terminate.bind(null, client, collector)
    await terminationListener(client, collector, terminateBound)

    collector.on('collect', async i => {
        let update, execute;
        switch (i.customId) {
            case 'Change':
                update = i.update({content: 'Server Change Requested', components: []});
                execute = client.commands.get('mc-change-server').execute(client, interaction, guildData);
                break;
            case 'List':
                update = i.update({content: 'Server List Requested', components: []});
                execute = client.commands.get('mc-list-servers').execute(client, interaction, guildData);
                break;
            default:
                return;
        }
        await Promise.all([update, execute])
    });

    collector.on('end', async collected => {
        removeTerminationListener(terminateBound)
        if (collected.size === 0) {
            await interaction.editReply({components: []})
        }
    });
}
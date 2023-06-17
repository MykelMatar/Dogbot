import {CommandInteraction, ComponentType, Message} from "discord.js";
import {CustomClient} from "../../myTypes";
import {removeTerminationListener, terminate, terminationListener} from "../otherHelpers/terminationListener";

/**
 * button collector for mc-server-status command. In a seperate function because it is used twice and writing
 * it twice looks dumb
 *
 * @param client
 * @param interaction
 * @param guildData
 * @param statusPrompt
 */
export async function statusButtonCollector(client: CustomClient, interaction: CommandInteraction, guildData, statusPrompt: Message) {

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

    collector.on('collect', i => {
        switch (i.customId) {
            case 'Change':
                i.update({content: 'Server Change Requested', components: []});
                client.commands.get('mc-select-server').execute(client, interaction, guildData);
                break;
            case 'List':
                i.update({content: 'Server List Requested', components: []});
                client.commands.get('mc-list-servers').execute(client, interaction, guildData);
                break;
            default:
                return;
        }
    });

    collector.on('end', async collected => {
        removeTerminationListener(terminateBound)
        if (collected.size === 0) {
            await interaction.editReply({components: []})
        }
    });
}
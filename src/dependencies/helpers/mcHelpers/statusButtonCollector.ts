import {CommandInteraction, ComponentType, Message} from "discord.js";
import {CustomClient} from "../../myTypes";
import {removeTerminationListener, terminate, terminationListener} from "../otherHelpers/terminationListener";
import messageStillExists from "../otherHelpers/messageStillExists";

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
        max: 1,
        filter: i => {
            if (i.user.id !== interaction.member.user.id) return false;
            if (i.customId !== 'change') return false
            return i.message.id === statusPrompt.id
        }
    });
    let terminateBound = terminate.bind(null, client, collector)
    terminationListener(client, collector, terminateBound)

    collector.on('collect', i => {
        i.update({content: 'Server Change Requested', components: []});
        client.commands.get('mc-select-server').execute(client, interaction, guildData);
    });

    collector.on('end', async collected => {
        removeTerminationListener(terminateBound)
        if (!(await messageStillExists(statusPrompt, terminateBound))) return
        if (collected.size === 0) {
            await interaction.editReply({components: []})
        }
    });
}
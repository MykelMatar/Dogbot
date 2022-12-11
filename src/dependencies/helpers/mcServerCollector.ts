import {CommandInteraction, ComponentType, Message} from "discord.js";
import {newClient} from "../myTypes";
import log from "../logger";
import {terminationListener} from "./terminationListener";

/**
 * button collector for minecraft commands
 *
 * @param client
 * @param interaction
 * @param guildData
 * @param guildName
 * @param statusPrompt
 */
export async function McServerCollector(client: newClient, interaction: CommandInteraction, guildData, guildName: string, statusPrompt: Message){
    const filter = i => i.user.id === interaction.member.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 10000 }); 

    const command1 = client.commands.get('mc-change-server');
    const command2 = client.commands.get('mc-list-servers');

    collector.on('collect', async i => {
        if (i.message.id != statusPrompt.id) return
        let update, execute;
        if (i.customId === 'Change') {
            update = i.update({ content: 'Server Change Requested', components: [] });
            execute = command1.execute(client, interaction, guildData, guildName);
            collector.stop()
        }
        else if (i.customId === 'List') {
            update = i.update({ content: 'Server List Requested', components: [] });
            execute = command2.execute(client, interaction, guildData, guildName);
            collector.stop()
        }
        await Promise.all([update, execute])
    });

    collector.on('end', async collected => {
        log.info(`mc collected ${collected.size} button presses`)
        if (collected.size === 0) await interaction.editReply({ components: [] })  // remove buttons
    });

    let terminate: boolean = false
    await terminationListener(client, collector, terminate)
}
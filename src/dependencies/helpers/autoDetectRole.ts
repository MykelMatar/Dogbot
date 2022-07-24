import guilds from "../schemas/guild-schema";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Message} from "discord.js";
import {newClient} from "../myTypes";
import {log} from "../logger";

export async function autoDetectRole(client: newClient, message: Message) {
    const currentGuild = await guilds.findOne({guildId: message.guildId})
    if (!currentGuild) return
    let selectedRole = currentGuild.ServerData.roles.autoenlist

    if (selectedRole == null) return; // return if no selected roll
    else if (message.content.includes(`${selectedRole}`)) {
        log.info('autoenlist role detected');
        // generate buttons
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Yes')
                    .setLabel('Yes')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('No')
                    .setLabel('No')
                    .setStyle(ButtonStyle.Danger),
            );

        let sent = await message.reply({ content: 'Would you like to enlist members for your event?', components: [row] })

        // create collector
        const filter = i => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 10000 }); // only message author can interact, 1 response, 10s timer 
        const command = client.commands.get('enlist-users'); // retrieve command for button

        // collect response and handle interaction
        collector.on('collect', async i => {
            if (i.customId === 'No') return collector.stop()
            if (i.customId === 'Yes') {
                await command.execute(client, message, currentGuild);
                return collector.stop()
            }
        });

        collector.on('end', async () => {
            await sent.delete();   // remove buttons
        });
    }
}
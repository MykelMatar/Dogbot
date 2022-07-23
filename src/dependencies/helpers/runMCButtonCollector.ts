import {CommandInteraction, ComponentType} from "discord.js";

export async function runMCButtonCollector(client, interaction: CommandInteraction, guildData, guildName: string){
    const filter = i => i.user.id === interaction.member.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 10000 }); // only message author can interact, 1 response, 10s timer 

    const command1 = client.commands.get('mc-change-server');
    const command2 = client.commands.get('mc-list-servers');

    collector.on('collect', async i => {
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
        console.log(`mc collected ${collected.size} button presses`)
        if (collected.size === 0) await interaction.editReply({ components: [] })  // remove buttons
    });
}
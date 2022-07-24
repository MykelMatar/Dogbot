import {CommandInteraction, ComponentType, EmbedBuilder} from "discord.js";

export async function singleStatusCollectResponse(interaction: CommandInteraction, embed: EmbedBuilder, server: object, guildData){
    const serverList = guildData.MCServerData.serverList

    // create collector
    const filter = i => i.user.id === interaction.member.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 10000
    });

    // collect response
    collector.on('collect', async i => {
        // interaction handling
        if (i.customId === 'SingleAdd') {
            await i.update({
                embeds: [embed],
                content: 'Adding Server (if possible)',
                components: []
            });
            serverList.push(server);
            await guildData.save();
            collector.stop()
        }
    });

    collector.on('end', async collected => {
        if (collected.size === 0)
            await interaction.editReply({embeds: [embed], components: []}) // remove buttons & embed
        else if (collected.first().customId === 'SingleAdd')
            await interaction.editReply({
                content: 'server added successfully',
                embeds: [embed],
                components: []
            })
    });
}
import {CommandInteraction, ComponentType, Message} from "discord.js";


export function createMcCommandCollector(interaction: CommandInteraction, interactionMessage: Message, customIds: string[]) {
    return interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.SelectMenu,
        time: 600000,
        max: 1,
        filter: (i) => {
            if (i.user.id !== interaction.member.user.id) return false;
            if (i.message.id !== interactionMessage.id) return false;
            return customIds.includes(i.customId);
        },
    });
}
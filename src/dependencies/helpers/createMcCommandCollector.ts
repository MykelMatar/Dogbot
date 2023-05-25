import {CommandInteraction, ComponentType, Message} from "discord.js";


export function createMcCommandCollector(interaction: CommandInteraction, interactionMessage: Message) {
    return interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.SelectMenu,
        time: 120000,
        max: 1,
        filter: (i) => {
            if (i.user.id !== interaction.member.user.id) return false;
            return i.message.id === interactionMessage.id;
        },
    });
}
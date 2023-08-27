import {
    ActionRowBuilder,
    ButtonInteraction,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    Message,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import embedLimits from "../../constants/embedLimits";

export default async function(interaction: ButtonInteraction, predictionEmbed: EmbedBuilder, predictionPrompt: Message) {

    const pendingResponse: string[] = []

    const modal = new ModalBuilder()
        .setTitle('Edit Title')
        .setCustomId('editTitleModal')

    const TitleActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
            .setCustomId('titleInput')
            .setLabel(`Enter new title`)
            .setRequired(true)
            .setPlaceholder('Title')
            .setMaxLength(embedLimits.title)
            .setMinLength(1)
            .setStyle(TextInputStyle.Short)
    );
    modal.addComponents(TitleActionRow);

    await interaction.showModal(modal)

    const modalFilter = (modalInteraction) =>
        modalInteraction.customId === 'editTitleModal'

    interaction.awaitModalSubmit({filter: modalFilter, time: 30_000})
        .then(async (modalInteraction) => {
            predictionEmbed.data.title = modalInteraction.fields.getTextInputValue('titleInput')
            await predictionPrompt.edit({embeds: [predictionEmbed]});
            await modalInteraction.reply({content: 'Title Updated.', ephemeral: true})
            pendingResponse.splice(pendingResponse.indexOf(interaction.user.id), 1)
        })
        .catch(() => {
            pendingResponse.splice(pendingResponse.indexOf(interaction.user.id), 1)
        });
}
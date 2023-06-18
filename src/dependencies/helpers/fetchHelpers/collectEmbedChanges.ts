import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    Message,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import {embedLimits} from "../../constants/embedLimits";

export async function collectEmbedChanges(interaction: ButtonInteraction, fetchEmbed: EmbedBuilder, enlistPrompt: Message) {

    const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('editSelectMenu')
                .setPlaceholder('Nothing selected')
                .addOptions(
                    {
                        label: 'Title',
                        description: 'Change the title',
                        value: 'editTitle',
                    },
                    {
                        label: 'Game / Minimum Gamers',
                        description: 'Change the game and minimum gamers required to game',
                        value: 'editGame',
                    },
                    {
                        label: 'Time',
                        description: 'Change the time you want to game at',
                        value: 'editTime',
                    }
                ),
        );

    const confirmationButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setLabel(`✓`)
                .setCustomId('confirmEdit')
                .setStyle(ButtonStyle.Success),
        );

    const editPrompt = await interaction[interaction.replied ? 'editReply' : 'reply']({
        content: `Select a field to edit. Press the ✓ button when done.`,
        components: [selectMenu, confirmationButton],
        ephemeral: !interaction.replied
    });

    const pendingResponse: string[] = []

    const editCollector = interaction.channel.createMessageComponentCollector({
        time: 60000,
        filter: async (i) => {
            const message = await interaction.fetchReply();
            if (i.message.id != message.id) return false
            return ['editSelectMenu', 'confirmEdit'].includes(i.customId);
        },
    });

    editCollector.on('collect', async editInteraction => {
        if (editInteraction.componentType == ComponentType.Button) {
            editPrompt.delete()
            editCollector.stop()
            return
        }
        if (pendingResponse.includes(editInteraction.user.id)) {
            await editInteraction.reply({content: `Please wait 15s before trying again`, ephemeral: true})
            return
        }
        pendingResponse.push(editInteraction.user.id)

        if (editInteraction.values[0] === 'editTitle') {
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

            await editInteraction.showModal(modal)

            const modalFilter = (modalInteraction) =>
                modalInteraction.customId === 'editTitleModal' &&
                modalInteraction.user.id == editInteraction.user.id;

            editInteraction.awaitModalSubmit({filter: modalFilter, time: 30_000})
                .then(async (modalInteraction) => {
                    fetchEmbed.data.title = modalInteraction.fields.getTextInputValue('titleInput')
                    await enlistPrompt.edit({embeds: [fetchEmbed]});
                    modalInteraction.reply({content: 'Title Updated.', ephemeral: true})
                    pendingResponse.splice(pendingResponse.indexOf(editInteraction.user.id), 1)
                })
                .catch(() => {
                    pendingResponse.splice(pendingResponse.indexOf(editInteraction.user.id), 1)
                });

        } else if (editInteraction.values[0] === 'editGame') {
            const modal = new ModalBuilder()
                .setTitle('Edit Game and Minimum Gamers')
                .setCustomId('editGameModal')

            const gameActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('gameInput')
                    .setLabel(`Enter new game`)
                    .setRequired(true)
                    .setPlaceholder('Fortnite')
                    .setMaxLength(embedLimits.title)
                    .setMinLength(1)
                    .setStyle(TextInputStyle.Short)
            );
            const minActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('minInput')
                    .setLabel(`Enter how many gamers you need`)
                    .setRequired(true)
                    .setPlaceholder('100')
                    .setMaxLength(4)
                    .setMinLength(1)
                    .setStyle(TextInputStyle.Short)
            );
            modal.addComponents(gameActionRow, minActionRow);

            const modalFilter = (modalInteraction) =>
                modalInteraction.customId === 'editGameModal' &&
                modalInteraction.user.id == editInteraction.user.id;

            editInteraction.awaitModalSubmit({filter: modalFilter, time: 30_000})
                .then(async (modalInteraction) => {
                    const minGamers = modalInteraction.fields.getTextInputValue('minInput')
                    const newGame = modalInteraction.fields.getTextInputValue('gameInput')
                    const isNumeric = /^\d+$/.test(minGamers);

                    if (!isNumeric) {
                        modalInteraction.reply({content: 'Input a valid number (1-9999).', ephemeral: true})
                        pendingResponse.splice(pendingResponse.indexOf(editInteraction.user.id), 1)
                        return
                    }

                    const timeString = fetchEmbed.data.description.split('\n')[1];
                    fetchEmbed.data.description = `need ${minGamers} for ${newGame}\n${timeString}`
                    await enlistPrompt.edit({embeds: [fetchEmbed]});
                    modalInteraction.reply({content: 'Description Updated.', ephemeral: true})
                    pendingResponse.splice(pendingResponse.indexOf(editInteraction.user.id), 1)
                })
                .catch(() => {
                    pendingResponse.splice(pendingResponse.indexOf(editInteraction.user.id), 1)
                });
            await editInteraction.showModal(modal)

        } else if (editInteraction.values[0] === 'editTime') {
            const modal = new ModalBuilder()
                .setTitle('Edit Time')
                .setCustomId('editTimeModal')

            const timeActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('timeInput')
                    .setLabel(`Enter new time`)
                    .setRequired(true)
                    .setPlaceholder('00:00 am')
                    .setMaxLength(50)
                    .setMinLength(1)
                    .setStyle(TextInputStyle.Short)
            );
            modal.addComponents(timeActionRow);

            await editInteraction.showModal(modal)

            const modalFilter = (modalInteraction) =>
                modalInteraction.customId === 'editTimeModal' &&
                modalInteraction.user.id == editInteraction.user.id;

            editInteraction.awaitModalSubmit({filter: modalFilter, time: 30_000})
                .then(async (modalInteraction) => {
                    const newTime = modalInteraction.fields.getTextInputValue('timeInput')

                    const gameString = fetchEmbed.data.description.split('\n')[0];
                    fetchEmbed.data.description = `${gameString}\n*set for ${newTime}*`
                    await enlistPrompt.edit({embeds: [fetchEmbed]});
                    modalInteraction.reply({content: 'Time Updated.', ephemeral: true})
                    pendingResponse.splice(pendingResponse.indexOf(editInteraction.user.id), 1)
                })
                .catch(() => {
                    pendingResponse.splice(pendingResponse.indexOf(editInteraction.user.id), 1)
                });
        }
    })

    editCollector.on('end', async () => {
        await interaction.followUp({content: 'Response Timeout', ephemeral: true})
        editPrompt.delete()
    })
}
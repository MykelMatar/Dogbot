import {ActionRowBuilder, StringSelectMenuBuilder} from "discord.js";

export const timeMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('time')
            .setPlaceholder('Select when you will be available:')
            .addOptions(
                {
                    label: 'Not sure',
                    value: 'Not sure'
                },
                {
                    label: '12:00am',
                    value: '12:00am'
                },
                {
                    label: '1:00am',
                    value: '1:00am'
                },
                {
                    label: '2:00am',
                    value: '2:00am'
                },
                {
                    label: '3:00am',
                    value: '3:00am'
                },
                {
                    label: '4:00am',
                    value: '4:00am'
                },
                {
                    label: '5:00am',
                    value: '5:00am'
                },
                {
                    label: '6:00am',
                    value: '6:00am'
                },
                {
                    label: '7:00am',
                    value: '7:00am'
                },
                {
                    label: '8:00am',
                    value: '8:00am'
                },
                {
                    label: '9:00am',
                    value: '9:00am'
                },
                {
                    label: '10:00am',
                    value: '10:00am'
                },
                {
                    label: '11:00am',
                    value: '11:00am'
                },
                {
                    label: '12:00pm',
                    value: '12:00pm'
                },
                {
                    label: '1:00pm',
                    value: '1:00pm'
                },
                {
                    label: '2:00pm',
                    value: '2:00pm'
                },
                {
                    label: '3:00pm',
                    value: '3:00pm'
                },
                {
                    label: '4:00pm',
                    value: '4:00pm'
                },
                {
                    label: '5:00pm',
                    value: '5:00pm'
                },
                {
                    label: '6:00pm',
                    value: '6:00pm'
                },
                {
                    label: '7:00pm',
                    value: '7:00pm'
                },
                {
                    label: '8:00pm',
                    value: '8:00pm'
                },
                {
                    label: '9:00pm',
                    value: '9:00pm'
                },
                {
                    label: '10:00pm',
                    value: '10:00pm'
                },
                {
                    label: '11:00pm',
                    value: '11:00pm'
                },
            )
    )
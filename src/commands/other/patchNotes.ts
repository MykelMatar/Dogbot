import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder
} from "discord.js";
import {CustomClient, embedColor, SlashCommand} from "../../dependencies/myTypes";
import handlePageChange from "../../dependencies/helpers/otherHelpers/handlePageChange";

export const patchNotes: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('patch-notes')
        .setDescription('gets most recent Dogbot patch notes'),

    async execute(client: CustomClient, interaction: CommandInteraction) {
        const dogbotInfo = require('../../../package.json')

        const pn8_20_2023 = new EmbedBuilder()
            .setTitle(`Dogbot Patch Notes (v${dogbotInfo.version})`)
            .setDescription(`August 20, 2023`)
            .addFields(
                {
                    name: 'fetch-gamers',
                    value: `• now supports timezones 
                            • if time option is used, it will prompt you for your timezone by default. this will only occur once.
                            • supports 'hh:mm am/pm' and 24 hour formats
                            • fetch-gamers will now end when the specified time arrives (or will still default to 3 hours if no time is specified)
                            • the Summon Gamers button was removed and now automatically mentions necessary people when it's gamer time`
                },
                {
                    name: 'new commands',
                    value: `• **set-timezone**: sets timezone used in fetch-gamer timer calculations (aka when the prompt ends and when the gamers are @\'d)
                            • **patch-notes**: Does this! shows you the most recent updates to Dogbot. `
                },
                {
                    name: 'misc',
                    value: `• renamed all instances of 'enlist' to 'accept'`
                },
            )
            .setColor(embedColor)

        const pn8_25_2023 = new EmbedBuilder()
            .setTitle(`Dogbot Patch Notes (v${dogbotInfo.version})`)
            .setDescription(`August 25, 2023`)
            .addFields(
                {
                    name: 'help',
                    value: `• revamped command, has details on every single command now instead of just linking to wiki. more user friendly`
                },
                {
                    name: 'predictions',
                    value: `• Added 'biggest loss' and 'biggest win' prediction stats`
                },
                {
                    name: 'misc',
                    value: `• deleting interactions like 'fetch-gamers' or 'prediction' no longer crashes Dogbot`
                },
            )
            .setColor(embedColor)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`← `)
                    .setCustomId('prevPage')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel(`→`)
                    .setCustomId('nextPage')
                    .setStyle(ButtonStyle.Primary),
            );

        const pages = {
            0: pn8_25_2023, // always set as newest
            1: pn8_20_2023,
        }

        await handlePageChange(interaction, row, pages, 'patch-notes')

    }
}
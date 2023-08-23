import {
    ActionRowBuilder,
    APISelectMenuOption,
    CommandInteraction,
    ComponentType,
    SlashCommandBuilder,
    StringSelectMenuBuilder
} from "discord.js";
import {CustomClient, MongoGuild, SlashCommand} from "../../dependencies/myTypes";
import {timezonesNegative, timezonesPositive} from "../../dependencies/constants/timeZones";
import {generateMenuOptions} from "../../dependencies/helpers/otherHelpers/generateTimeZoneOptions";
import log from "../../dependencies/constants/logger";

export const setTimezone: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('set-timezone')
        .setDescription('sets the timezone used when fetching gamers'),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {

        const menuOptionsNegative: APISelectMenuOption[] = generateMenuOptions(timezonesNegative)
        const menuOptionsPositive: APISelectMenuOption[] = generateMenuOptions(timezonesPositive)

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('timeZoneSelectMenu')
                    .setPlaceholder('UTC-')
                    .addOptions(menuOptionsNegative),
            )

        const row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('timeZoneSelectMenu2')
                    .setPlaceholder('UTC+')
                    .addOptions(menuOptionsPositive),
            )

        const sent = await interaction.reply({
            content: 'Select a Timezone',
            components: [row, row2],
            ephemeral: true
        });

        const timeZoneSelectionFilter = async (i) => {
            // if (i.message.id != sent.id) return false
            if (i.user.id != interaction.user.id) return false
            return ['timeZoneSelectMenu', 'timeZoneSelectMenu2'].includes(i.customId);
        };

        try {
            const timeZoneInteraction = await sent.awaitMessageComponent({
                componentType: ComponentType.StringSelect,
                filter: timeZoneSelectionFilter,
                time: 5000//240_000
            })

            // get name of timezone
            const getKeyByValue = ((object, value) => {
                for (const [key, val] of Object.entries(object)) {
                    if (val === value) {
                        return key;
                    }
                }
                return null; // Value not found in the object
            })

            let timeZoneName
            const isNegativeTimeZone = getKeyByValue(timezonesNegative, timeZoneInteraction.values[0])
            const isPositiveTimeZone = getKeyByValue(timezonesPositive, timeZoneInteraction.values[0])

            if (isNegativeTimeZone) {
                timeZoneName = isNegativeTimeZone
            } else if (isPositiveTimeZone) {
                timeZoneName = isPositiveTimeZone
            }

            guildData.settings.timeZone = {
                offset: timeZoneInteraction.values[0],
                name: timeZoneName
            }
            await guildData.save()

            await sent.edit({content: `Timezone set to ${timeZoneName}`, components: []})
        } catch (e) {
            log.error(e.message)
            await sent.edit({content: `Response Timeout`, components: []})
        }


    }
}
import {APISelectMenuOption} from "discord.js";

export function generateMenuOptions(timezones: Record<string, string>): APISelectMenuOption[] {
    const menuOptions = [];

    for (const timezone in timezones) {
        const UTCvalue = timezones[timezone];

        menuOptions.push({
            label: timezone,
            description: `UTC${UTCvalue}`,
            value: UTCvalue,
        });
    }

    return menuOptions;
}
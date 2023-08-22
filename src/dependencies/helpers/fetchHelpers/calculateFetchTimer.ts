import {DateTime} from "luxon";
import {MongoGuild} from "../../myTypes";

export default function(time, guildData: MongoGuild): number {
    const getDateTime = (timeString: string): DateTime | undefined => {
        const normalizedTimeString = timeString.replace(/\s+(am|pm)$/i, '$1');
        const formats = ['h:mma', 'ha', 'H:mm']; // Add more formats as needed

        for (const format of formats) {
            const parsedTime = DateTime.fromFormat(normalizedTimeString, format);
            if (parsedTime.isValid) {
                return parsedTime;
            }
        }
        return undefined;
    };

    let validTime = getDateTime(time)
    let timer: number = 1.08e+7 // 3 hour default timer

    if (validTime) {
        const now = DateTime.local();

        // daylight savings check
        let offset = guildData.settings.timeZone.offset
        const daylightSavingsZones = ['-10', '-9', '-8', '-7', '-6', '-5', '-4']
        // this works bc bot server is in NY, so now.isInDST will always be valid
        if (daylightSavingsZones.includes(offset) && now.isInDST) {
            let newOffset = parseInt(offset, 10) + 1
            offset = newOffset.toString()
        }

        validTime = validTime.setZone(`UTC${offset}`, {keepLocalTime: true})
        const nowRezoned = now.setZone(`UTC${offset}`)
        console.log(`UTC${offset}`, validTime.toFormat('h:m'), nowRezoned.toFormat('h:m'))
        // If the future time is earlier than the current time, add one day to the future time
        if (validTime <= now) {
            validTime = validTime.plus({days: 1});
        }

        timer = validTime.diff(nowRezoned).as('milliseconds');
        console.log(timer)
        return timer > 8.28e+7 ? 1.08e+7 : timer // if timer is greater than 24 hours default to 3 hour time
    }
}
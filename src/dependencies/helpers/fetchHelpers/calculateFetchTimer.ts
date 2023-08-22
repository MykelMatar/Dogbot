import {DateTime} from "luxon";
import {MongoGuild} from "../../myTypes";

export default function(client, time, guildData: MongoGuild): number {
    const getDateTime = (timeString: string): DateTime | undefined => {
        const normalizedTimeString = timeString.replace(/\s+(am|pm)$/i, '$1');
        const formats = ['h:mma', 'ha', 'H:mm']; // Add more formats as needed

        for (const format of formats) {
            const parsedTime = DateTime.fromFormat(normalizedTimeString, format, {locale: 'en-us'});
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
        const centralTime = now.setZone('America/Chicago')
        // daylight savings check
        let offset = guildData.settings.timeZone.offset
        const daylightSavingsZones = ['-10', '-9', '-8', '-7', '-6', '-5', '-4']

        if (daylightSavingsZones.includes(offset) && centralTime.isInDST) {
            let newOffset = parseInt(offset, 10) + 1
            offset = newOffset.toString()
        }

        validTime = validTime.minus({days: 1}) // server is 1 day ahead or something not sure whats goin on
        validTime = validTime.setZone(`UTC${offset}`, {keepLocalTime: true})
        const nowRezoned = now.setZone(`UTC${offset}`)
        console.log(`UTC${offset}`, {validTime}, {nowRezoned})
        // If the future time is earlier than the current time, add one day to the future time
        if (validTime <= now) {
            validTime = validTime.plus({days: 1});
        }

        timer = validTime.diff(nowRezoned).as('milliseconds');
        console.log(timer / 60 / 60 / 1000)
        return timer > 8.28e+7 ? 1.08e+7 : timer // if timer is greater than 24 hours default to 3 hour time
    }
}
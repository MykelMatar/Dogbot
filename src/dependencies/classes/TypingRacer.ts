import {updateUserData, StatName} from "../helpers/updateUserData";

export class TypingRacer {
    name: string
    id: string
    WPM: number
    rawWPM: number
    accuracy: number
    isWinner: boolean

    public async updateUserData(message, statName: StatName) {
        let trStats = [this.WPM, this.rawWPM, this.accuracy, this.isWinner]
        await updateUserData(message, [this.id], statName, trStats)
    }

    constructor(name: string, id: string, WPM: number, rawWPM: number, accuracy: number) {
        this.name = name
        this.id = id
        this.WPM = WPM
        this.rawWPM = rawWPM
        this.accuracy = accuracy
        this.isWinner = false
    }
}
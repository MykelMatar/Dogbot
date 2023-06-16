/**
 * Logic for leveling system
 *  - Enlists grant 10 XP, rejects grant 5 (what to do about perhaps gamers that game?)
 *  - Enlist streaks grant more XP
 *  - Reject ends an fetch streak
 *  - Each level requires more xp than the last
 *      - everyone starts at level 1
 *      - level 2 requires 10 xp
 *      - every level requires an additional 10xp
 *      - Enlists give base 10xp
 *      - Enlist streak caps out at 10
 *          - Every fetch streak level grants an additional 5xp per fetch (max of 50)
 *      - no streak, lvl 50 = 500/10 = 50 enlists
 *      - with consistent streak, lvl 50 = 500-270 / 50 =  ~14 enlists (i think)
 *  - Prestige leveling after level 50
 *  - 10 prestiges then Master Prestige
 *  - store user xp as number that only increases over time (no reset on prestige)
 *      - map xp values to levels and prestiges that get calculated when needed
 *      - OR also store lvl so that it doesnt need to be calculated every time? dec tax on system but inc usage in db
 *
 *  extras
 *  - Make custom symbols for each one so people get badge in the prompt
 */

/**
 * prestige after about ~100 enlists (no streak)
 * max prestige at about ~500 enlists (no streak)
 * each fetch gives 10xp, which means 100*50 / 10 = 500 xp per prestige
 */
// define leveling system
let xpForLevel = [10];
const maxLevel = 50
const numberOfPrestiges = 5
const numberOfLevelsBeforeMax = maxLevel * numberOfPrestiges
const maxPrestigeMaxLevel = 1000 + numberOfLevelsBeforeMax // pseudo infinite leveling after hitting max prestige
const levelsPerPrestige = 50
const baseXPIncreasePerLevel = 10

// create array of xp values for each level (1 indexed bc lvl 0 does not exist)
for (let i = 1; i < maxPrestigeMaxLevel; i++) {
    let scalingFunction
    if (i < 50) {
        scalingFunction = Math.floor((i + 5) ^ 2)
    } else {
        scalingFunction = Math.floor(i / 3)
    }
    xpForLevel.push(xpForLevel[i - 1] + (baseXPIncreasePerLevel + scalingFunction));
}

export function getLevelFromXp(xp: number): { prestige: string, level: number } {
    let level: number = 0, prestigeValue: string | number = 0, prestige: string = 'Prestige 0'
    if (xp == 0 || xp == undefined) return {prestige, level}

    for (let i = 0; i < xpForLevel.length; i++) {
        if (xp < xpForLevel[i]) {
            level = i + 1; // levels are 1-indexed
            if (level <= numberOfLevelsBeforeMax) {
                prestigeValue = Math.floor(level / levelsPerPrestige)
                level -= Math.floor(levelsPerPrestige * prestigeValue)
            } else {
                prestigeValue = 'Master Prestige'
                level -= Math.floor(levelsPerPrestige * 5)
            }
            level = (level == 0) ? 1 : level

            if (prestigeValue !== 'Master Prestige') {
                prestige = `Prestige ${prestigeValue}`
            } else {
                prestige = prestigeValue
            }

            return {prestige, level}
        }
    }
    return {prestige: 'Master Prestige', level: 1000}; // max level surpassed
}
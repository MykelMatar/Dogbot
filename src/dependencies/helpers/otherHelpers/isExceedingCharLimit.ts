export function isExceedingCharacterLimit(arr: string[], limit: number): boolean {
    let totalCharacters = 0;
    for (const str of arr) {
        totalCharacters += str.length;
    }
    return totalCharacters > limit;
}
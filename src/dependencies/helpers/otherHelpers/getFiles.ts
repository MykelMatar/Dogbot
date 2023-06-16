import {Dirent} from "fs";
import * as fs from 'node:fs'

/**
 * gets all files of a certain type in a given directory and its subdirectories
 *
 * @param dir - directory to get files from
 * @param suffix - file suffix
 * @param ignore - array of directories to ignore
 */
export const getFiles = (dir: string, suffix: string, ignore?: string[]): string[] => {
    const files: Dirent[] = fs.readdirSync(dir, {
        withFileTypes: true,
    })
    let commandFiles: string[] = []

    for (const file of files) {
        if (file.isDirectory() && !(ignore?.includes(file.name))) {
            commandFiles = [
                ...commandFiles,
                ...getFiles(`${dir}/${file.name}`, suffix, ignore)
            ]
        } else if (file.name.endsWith(suffix)) {
            commandFiles.push(`${dir}/${file.name}`)
        }
    }
    return commandFiles
}
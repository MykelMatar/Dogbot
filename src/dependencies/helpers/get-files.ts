import {Dirent} from "fs";
import * as fs from 'node:fs'

export const getFiles = (dir: string, suffix: string): string[] => {
    const files: Dirent[] = fs.readdirSync(dir, {
        withFileTypes: true,
    })

    let commandFiles: string[] = []

    for (const file of files) {
        if (file.isDirectory()) {
            commandFiles = [
                ...commandFiles,
                ...getFiles(`${dir}/${file.name}`, suffix)
            ]
        } else if (file.name.endsWith(suffix)) {
            commandFiles.push(`${dir}/${file.name}`)
        }
    }
    return commandFiles
}
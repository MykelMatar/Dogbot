import {Client} from "discord.js";
import requireDir from 'require-dir'
const dir = requireDir('../commands', {extension: '.js', recurse: true});

export default (client: Client) => {
    const commandFiles = dir;
    const cmdFolders = ['test']
    //const cmdFolders = ['creation', 'enlist_user', 'games', 'get_stats', 'help', 'mc', 'role_selection']

    cmdFolders.forEach(cmd => {
        for (const file in commandFiles[cmd]) {
            const command = require(`../commands/${cmd}/${file}`);
            if (command.default.name) {
                // @ts-ignore
                client.commands.set(command.default.name, command);
            }
        }
    })
}


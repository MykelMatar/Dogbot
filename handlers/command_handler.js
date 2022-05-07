const fs = require('fs');
const path = require('path');
var requireDir = require('require-dir');
var dir = requireDir('../commands', { extensions: ['.js'], recurse: true });

module.exports = (client) => {
    const commandFiles = dir;
    const cmdFolders = ['enlist_user', 'get_stats', 'help', 'mc', 'role_selection']

    for (i = 0; i < cmdFolders.length; i++) { 
        for (const file in commandFiles[`${cmdFolders[i]}`]) {
            const command = require(`../commands/${cmdFolders[i]}/${file}`);
            if (command.name) {
                client.commands.set(command.name, command);
            }
            else {
                continue;
            }
        }
    }
}
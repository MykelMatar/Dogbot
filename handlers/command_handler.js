const requireDir = require('require-dir');
const dir = requireDir('../commands', {extension: '.js', recurse: true});

module.exports = (client) => {
    const commandFiles = dir;
    const cmdFolders = ['creation', 'enlist_user', 'games', 'get_stats', 'help', 'mc', 'role_selection']
    
    for (let i = 0; i < cmdFolders.length; i++) { 
        for (const file in commandFiles[`${cmdFolders[i]}`]) {
            const command = require(`../commands/${cmdFolders[i]}/${file}`);
            if (command.name) {
                client.commands.set(command.name, command);
            }
        }
    }
}
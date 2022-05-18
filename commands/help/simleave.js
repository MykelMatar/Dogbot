
module.exports = {
    name: 'simleave', 
    description: 'simulates a leave for testing', 
    async execute(client, message){
        client.emit('guildMemberRemove', message.member)
    }
}

module.exports = {
    name: 'simjoin', 
    description: 'simulates a join for testing', 
    async execute(client, message, guildName){
        client.emit('guildMemberAdd', message.member)
    }
}
import {Command} from "../../dependencies/classes/Command";

export const simjoin = new Command(
    'simjoin',
    'simulates user joining',
    async (client, message) => {
        client.emit('guildMemberAdd', message.member)
    })
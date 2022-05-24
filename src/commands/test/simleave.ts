import {Category, Command} from "../../dependencies/classes/Command";

export const simleave = new Command(
    'simleave',
    'simulates user leaving',
    async (client, message) => {
        client.emit('guildMemberRemove', message.member)
    }
)
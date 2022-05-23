import {Category, Command} from "../../dependencies/classes/Command";
import util from 'minecraft-server-util';

export const mcAddServer = new Command(
    'mc-add-server',
    'Adds a new IP to the server list in Mongo',
    async (client, interaction) => {

        const serverList = mcAddServer.GuildData.MCServerData
        console.log(serverList)
    }
)
import {status, statusBedrock} from "minecraft-server-util";

/**
 * gets status of the servers in the mc server list
 *
 * @param MCServerData
 */
export const mcListServersGetStatus = async (MCServerData) => {
    const statusPromises = MCServerData.serverList.map(MCServer => {
        return status(MCServer.ip, MCServer.port, {timeout: 2000})
            .then(() => '*Online*')
            .catch(() =>
                statusBedrock(MCServer.ip, MCServer.port, {timeout: 2000})
                    .then(() => '*Online*')
                    .catch(() => '*Offline*'));
    });
    const statusResults = await Promise.all(statusPromises);
    return [...statusResults];
}
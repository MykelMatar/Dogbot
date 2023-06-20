import {status, statusBedrock} from "minecraft-server-util";

/**
 * gets status of the servers in the mc server list
 *
 * @param MCServerData
 */
export const checkListServerStatus = async (MCServerData): Promise<string[]> => {
    const statusPromises = MCServerData.serverList.map(MCServer => {
        return status(MCServer.ip, MCServer.port, {timeout: 5000})
            .then(() => '*Online*')
            .catch(() =>
                statusBedrock(MCServer.ip, MCServer.port, {timeout: 5000})
                    .then(() => '*Online*')
                    .catch(() => '*Offline*'));
    });
    const statusResults = await Promise.all(statusPromises);
    return [...statusResults];
}
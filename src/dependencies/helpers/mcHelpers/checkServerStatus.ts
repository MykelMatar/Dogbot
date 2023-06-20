import {MinecraftServer} from "../../myTypes";
import {status, statusBedrock} from "minecraft-server-util";
import log from "../../constants/logger";

export async function checkServerStatus(server: MinecraftServer): Promise<boolean> {
    try {
        await status(server.ip, server.port, {timeout: 5000});
        return true
    } catch {
        try {
            await statusBedrock(server.ip, server.port, {timeout: 5000});
            return true
        } catch {
            log.error('Invalid server / server offline')
            return false
        }
    }
}
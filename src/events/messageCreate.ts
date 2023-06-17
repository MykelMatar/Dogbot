import {CustomClient, MinecraftServer} from "../dependencies/myTypes";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, Message} from "discord.js";
import {popularMinecraftServers} from "../dependencies/constants/popularMinecraftServers";
import log from "../dependencies/constants/logger";
import guilds from "../dependencies/schemas/guild-schema";
import {status, statusBedrock} from "minecraft-server-util";


export async function messageCreate(client: CustomClient, message: Message) {

    let guildData = await guilds.findOne({guildId: message.guildId})
    if (!guildData?.settings?.autoDetectIP) return

    const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
    let ip: RegExpMatchArray | string = message.content.match(ipPattern)
    const hasIPAddress = ip ? message.content.includes(ip.toString()) : false

    const lowerCaseMessage = message.content.toLowerCase();
    const isMinecraftIP = popularMinecraftServers.some(server => lowerCaseMessage.includes(server.toLowerCase()))

    if (!(hasIPAddress || isMinecraftIP)) return

    let {serverList} = guildData.mcServerData
    if (serverList.length == 10) return

    ip = ip ? ip.toString() : popularMinecraftServers.find(server => lowerCaseMessage.includes(server.toLowerCase()))
    if (serverList.some(server => server.ip === ip)) {
        return log.warn("Duplicate IP Detected");
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setLabel(`Yes`)
                .setCustomId('AddIP')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setLabel(`No`)
                .setCustomId('NoAddIP')
                .setStyle(ButtonStyle.Danger),
        );

    log.info('ip detected')
    let detectionMessage = await message.channel.send({
        content: 'would you like to add this IP to the minecraft server list?',
        components: [row]
    })

    try {
        const yesId = row.components[0].data["custom_id"]
        const noId = row.components[1].data["custom_id"]
        const collectorFilter = i => {
            if (i.message.id != detectionMessage.id) return false // prevent simultaneous prompts from affecting each other
            return [yesId, noId].includes(i.customId);
        };
        const confirmation = await detectionMessage.awaitMessageComponent({filter: collectorFilter, time: 60000});

        if (confirmation.customId !== yesId) return
        log.info('adding server')

        let newServer: MinecraftServer = {
            name: ip,
            ip: ip,
            port: 25565
        };

        // make sure IP is a valid server IP by checking its status (server must be online for this to work)
        let validServer = true
        try {
            await status(newServer.ip, newServer.port);
        } catch {
            try {
                await statusBedrock(newServer.ip, newServer.port);
            } catch {
                validServer = false;
                log.warn('Invalid server / server offline')
                await message.channel.send(
                    {content: "Could not retrieve server status. Double check IP and make sure server is online."}
                );
            }
        }

        if (!validServer) return;
        if (serverList.length === 0) {
            const {ip, port, name} = newServer;
            guildData.mcServerData.selectedServer = {ip, port, name} // assuming you have variables named ip, port, and name that correspond to mcServer.ip, mcServer.port, and mcServer.name
        }
        serverList.push(newServer);

        const saveData = guildData.save()
        const sendConfirmation = message.channel.send({content: "Server added successfully"})
        await Promise.all([saveData, sendConfirmation]);

    } catch (e) {
        log.error(e)
    } finally {
        detectionMessage.delete()
    }


}
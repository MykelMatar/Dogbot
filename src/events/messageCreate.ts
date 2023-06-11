import {IGuild, NewClient} from "../dependencies/myTypes";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, Message} from "discord.js";
import {popularMinecraftServers} from "../dependencies/constants/popularMinecraftServers";
import log from "../dependencies/constants/logger";
import guilds from "../dependencies/schemas/guild-schema";


export async function messageCreate(client: NewClient, message: Message) {
    return // not ready yet

    const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
    let ip: RegExpMatchArray | string = message.content.match(ipPattern)
    const hasIPAddress = ip ? message.content.includes(ip[0]) : false

    const lowerCaseMessage = message.content.toLowerCase();
    const isMinecraftIP = popularMinecraftServers.some(server => lowerCaseMessage.includes(server.toLowerCase()))

    if (hasIPAddress || isMinecraftIP) {
        let guildData: IGuild = await guilds.findOne({guildId: message.guildId})
        let {serverList} = guildData.mcServerData
        if (serverList.length == 10) return

        ip = ip ? ip[0] : popularMinecraftServers.find(server => lowerCaseMessage.includes(server.toLowerCase()))
        if (serverList.some(server => server.ip === ip[0])) {
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
            if (confirmation.customId == yesId) {
                console.log('adding server')
            }
        } catch (e) {
            log.error(e)
        } finally {
            detectionMessage.delete()
        }
    }

}
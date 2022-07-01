import {Client, GuildMember, CommandInteraction, GuildCacheMessage, CacheType} from "discord.js";
import guilds from '../schemas/guild-schema'
import {BaseDocumentType} from "mongoose";

export class Command {
    name: string
    description: string
    requiresAdmin?: boolean
    executeCallback: (client: Client, interaction: CommandInteraction, guildName?: string) => void
    guildData: any

    public async execute(client: Client, interaction: CommandInteraction, guildName?: string): Promise<GuildCacheMessage<CacheType>> {
        if (!(!(interaction.member instanceof GuildMember) || interaction.member.partial)) {
            console.log(`${this.name} requested by ${interaction.member.user.username} in ${interaction.member.guild.name}`)
        }

        // @ts-ignore
        if (this.requiresAdmin && !interaction.member.permissions.has("ADMINISTRATOR")) {
            return interaction.editReply({content: "Only Admins can use this command"});
        }

        this.guildData = await guilds.findOne({guildId: interaction.guildId})
        this.executeCallback(client, interaction, guildName)
    }

    constructor(name: string, description: string, callback: (client, interaction: CommandInteraction, guildName?: string) => void) {
        this.name = name
        this.description = description
        this.executeCallback = callback

        if (this.requiresAdmin == null) {
            this.requiresAdmin = false
        }
    }
}
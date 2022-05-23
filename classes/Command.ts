import {Client, GuildMember, Interaction} from "discord.js";
import guilds from '../schemas/guild-schema'

export class Command {
    name: string
    description: string
    category: Category
    requiresAdmin?: boolean
    executeCallback: (client: Client, interaction: Interaction) => void
    GuildData: any
    cmdStatus: boolean
    
    public async execute(client: Client, interaction: Interaction): Promise<void> {
        this.cmdStatus = true
        if (!(!(interaction.member instanceof GuildMember) || interaction.member.partial)) {
            console.log(`${this.name} requested by ${interaction.member.user.username} in ${interaction.member.guild.name}`)
        }
        // @ts-ignore
        if (!interaction.member.permissions?.has("ADMINISTRATOR")) {
            this.cmdStatus = false
            // @ts-ignore
            return interaction.editReply("Only Admins can use this command");
        }
        
        this.GuildData = await guilds.findOne({guildId: interaction.guildId})
        this.executeCallback(client, interaction)
    }

    constructor(name: string, description: string, callback: (client, interaction) => Promise<void>) {
        this.name = name
        this.description = description
        this.executeCallback = callback
        
        if (this.requiresAdmin == null) {
            this.requiresAdmin = false
        }
    }
}

export enum Category {
    test,
    minecraft,
}

// export const command = new Command()
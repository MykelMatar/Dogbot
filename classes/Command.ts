import {Client, GuildMember, Interaction} from "discord.js";
import Guilds from '../schemas/guild-schema'

export class Command {
    name: string
    description: string
    category: Category
    requiresAdmin?: boolean
    executeCallback: (client: Client, interaction: Interaction) => void
    GuildData: typeof Guilds
    
    public async execute(client: Client, interaction: Interaction): Promise<void> {
        if (!(!(interaction.member instanceof GuildMember) || interaction.member.partial)) {
            console.log(`${this.name} requested by ${interaction.member.user.username} in ${interaction.member.guild.name}`)
        }
        this.GuildData = await Guilds.findOne({guildId: interaction.guildId})
        if (this.category === Category.test){
        }
        this.executeCallback(client, interaction)
    }

    constructor(name?: string, description?: string, callback?: (client, interaction) => Promise<void>) {
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
    mc
}

// export const command = new Command()
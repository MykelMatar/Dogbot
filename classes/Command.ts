import {Client, GuildMember, Interaction} from "discord.js";
import mongoose from "mongoose";

export class Command {
    name: string
    description: string
    requiresAdmin?: boolean

    public execute(client: Client, interaction: Interaction): void {
        if (!(!(interaction.member instanceof GuildMember) || interaction.member.partial)) {
            console.log(`${this.name} requested by ${interaction.member.user.username} in ${interaction.member.guild.name}`)
        }
    }

    constructor() {
        this.requiresAdmin = false
    }
}
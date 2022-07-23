import {SlashCommandBuilder} from "discord.js";
import {newClient} from "../../dependencies/myTypes";

export const simLeave = {
    data: new SlashCommandBuilder() 
        .setName('simleave')
        .setDescription('simulates user leaving'),
        
    async execute(client: newClient, message){
        client.emit('guildMemberRemove', message.member)
    }
}
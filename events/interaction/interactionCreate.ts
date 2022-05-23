import {Client} from "discord.js";
import {Interaction} from "discord.js";

export async function interactionCreate (client: Client, interaction: Interaction) {
    if (!interaction.isCommand()) return
    
    // @ts-ignore
    let commands = client.commands
    let guildName = interaction.guild.name.replace(/\s+/g, "");
    const { commandName, options } = interaction
    let ephemeralSetting;

    // Slash Command List + execution instructions

    // test commands
    if (commandName === 'test2') {
        await commands.get('test').execute(client,  interaction)
    }
    
    // minecraft commands
    if (commandName === 'mc-add-server') {
        await commands.get('mc-add-server').execute(client,  interaction)
    }
    
    // test commands
    if (commandName === 'simjoin') {
        await commands.get('simjoin').execute(client,  interaction)
    }
    if (commandName === 'simleave') {
        await commands.get('simleave').execute(client,  interaction)
    }
    
}
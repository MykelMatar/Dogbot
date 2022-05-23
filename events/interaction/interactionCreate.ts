import {Client} from "discord.js";
import {Interaction} from "discord.js";

export default async (client: Client, interaction: Interaction) => {
    if (!interaction.isCommand()) return
    
    // @ts-ignore
    let commands = client.commands
    let guildName = interaction.guild.name.replace(/\s+/g, "");
    const { commandName, options } = interaction
    let ephemeralSetting;

    // Slash Command List + execution instructions

    // creation commands
    if (commandName === 'test2') {
        console.log('test detected')
        await commands.get('test').execute(client,  interaction)
    }
}
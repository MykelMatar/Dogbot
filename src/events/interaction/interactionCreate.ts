import {CommandInteraction} from "discord.js";

export async function interactionCreate (client, interaction: CommandInteraction) {
    if (!interaction.isCommand()) return
    
    let commands = client.commands
    let guildName = interaction.guild.name.replace(/\s+/g, "");
    let ephemeralSetting
    const { commandName, options } = interaction
    
    /*
    * Slash Command Event Listener
    * Promise.All is not used because deferReply must occur before the command gets executed
     */
    for (let command of commands) {
        if (commandName == command[1].name){
            // @ts-ignore
            let hideOption = interaction.options._hoistedOptions.find(option => option.name === 'hide')
            if (hideOption === undefined) ephemeralSetting = true
            else ephemeralSetting = hideOption.value
            
            if (command[1].name.startsWith('mc') || command[1].name.startsWith('get-stats')){
                await interaction.deferReply({ ephemeral: ephemeralSetting })
            }
            await commands.get(command[1].name).execute(client, interaction, guildName)
            break
        }
    }
}
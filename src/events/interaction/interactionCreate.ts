import {CommandInteraction} from "discord.js";

export async function interactionCreate(client, interaction: CommandInteraction) {
    if (!interaction.isCommand()) return

    let commands = client.commands
    let guildName = interaction.guild.name.replace(/\s+/g, "");
    let ephemeralSetting
    let hideCommands: string[] = ['mc', 'get-stats', 'server-stats']
    const {commandName} = interaction
    
    // Slash Command Event Listener
    for (let command of commands) {
        if (commandName == command[1].name) {
            let hideOption = interaction.options.data.find(option => option.name === 'hide')
            if (hideOption === undefined) ephemeralSetting = true
            else ephemeralSetting = hideOption.value
            
            if (hideCommands.some(com => command[1].name.startsWith(com))) {
                await interaction.deferReply({ephemeral: ephemeralSetting})
            }
            if (command[1].name === 'enlist-users' && interaction.options.data.length !== 0) {
                await interaction.reply({content: `${interaction.options.data[0].value}`})
            }

            await commands.get(command[1].name).execute(client, interaction, guildName)
            break
        }
    }
}
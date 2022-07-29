import {CommandInteraction, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {newClient} from "../../dependencies/myTypes";

export const speak = {
    data: new SlashCommandBuilder() 
        .setName('speak')
        .setDescription('sends a message via Dogbot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // prevents members from saying bad things
        .addStringOption(option =>
            option.setName('message')
                .setDescription('message you want Dogbot to say (Dogbot is not held accountable)')
                .setRequired(true)),
        
    async execute(client: newClient, interaction: CommandInteraction){
        await interaction.reply({  ephemeral: true , content: '*message sent*'});
        interaction.channel.send(`${interaction.options.data[0].value}`)
    }
}
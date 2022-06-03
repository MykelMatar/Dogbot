import {Command} from "../../dependencies/classes/Command";
import {Client, CommandInteraction} from "discord.js";

export const setroleAutoenlist = new Command(
    'setrole-autoenlist', 
    'changes role used to trigger autoenlist', 
    async (client: Client, interaction: CommandInteraction) => {
    // push role id to mongo
    setroleAutoenlist.guildData.ServerData.roles.autoenlist = interaction.options.data[0].value
    await setroleAutoenlist.guildData.save()

    await interaction.reply({ephemeral: true, content: 'Autoenlist role set sucessfully'})
    console.log("Autoenlist role set");
})
import {Command} from "../../dependencies/classes/Command";
import {Client, CommandInteraction} from "discord.js";

export const clearroleAutoenlist = new Command(
    'clearrole-autoenlist', 
    'clears role used to trigger auto enlist',
    async (client: Client, interaction: CommandInteraction) => {
    // clear role id and push to mongo
    clearroleAutoenlist.guildData.ServerData.roles.autoenlist = null;
    await clearroleAutoenlist.guildData.save()

    await interaction.reply({ephemeral: true, content: 'Role Cleared Successfully'})
    console.log("Role cleared");
})
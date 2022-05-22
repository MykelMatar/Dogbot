//import {Command} from "../../classes/Command";

module.exports = {
    name: 'say',
    description: 'sends a message via Dogbot',
    async execute(client, interaction) {
        console.log(`say requested by ${interaction.member.user.username} in ${interaction.member.guild.name}`)
        
        await interaction.reply({  ephemeral: true , content: 'message sent'});
        interaction.channel.send(`${interaction.options._hoistedOptions[0].value}`)
    }
} 
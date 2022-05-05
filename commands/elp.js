const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const preventInteractionCollision = require('../helperFunctions/preventInteractionCollision');
cmdStatus = 0;


module.exports = {
    name: 'elp',
    description: 'lists all commands and relevant information',
    async execute(client, interaction) {
        console.log(`elp requested by ${interaction.member.user.username}`);

        // create embed for mc commands
        const mcEmbed = new MessageEmbed()
            .setTitle("mc elp")
            .setDescription(
                `**All commands are preceded by an !**
                mc commands involve showing and editing a minecraft server's 
                status and information`
            )
            .addFields(
                {
                    name: 'mc commands',
                    value:
                        `>>> **/mc**    
                        **/listmc**   
                        **/addmc**      
                        **/delmc**      
                        **/changemc**   
                        **/renamemc**   
                        **/changemcip** 
                        **/valstats** `,
                    inline: true
                },
                {
                    name: 'function',
                    value:
                    ` - tracks mc server status
                      - lists all mc servers and their respective IPs
                      - adds server to registered server list
                      - deletes server from registered server list
                      - changes the server being tracked by !mc
                      - changes an existing server's name
                      - changes an existing server's IP address
                      - retrieves account stats from Tracker.gg`,
                    inline: true
                },
            )
            .setColor("#F5F5F5")

        interaction.reply({ephemeral: true, embeds: [mcEmbed] });
    }
}
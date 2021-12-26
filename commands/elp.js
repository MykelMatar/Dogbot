const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const preventInteractionCollision = require('../helperFunctions/preventInteractionCollision');
cmdStatus = 0;


module.exports = {
    name: 'elp',
    description: 'lists all commands and relevant information',
    async execute(client, message, args, guildName) {
        console.log('elp requested');

        if (cmdStatus == 1) { return message.reply('elp command already running.') } // prevent multiple instances from running
        cmdStatus = 1;

        // generate select menu
        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('elpMenu')
                    .setPlaceholder('No elp')
                    .addOptions([
                        {
                            label: '!mc',
							description: "showing and editing a minecraft server's status and information",
							value: 'mc',
                        },
                        {
                            label: '!gt',
							description: 'creating and editing events',
							value: 'gt',
                        }
                    ]),
            );

        let sent = await message.reply({ content: 'Which commands would you like help with?', ephemeral: true, components: [row] });
          

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
                        `>>> **!mc**    
                        **!listmc**   
                        **!addmc**      
                        **!delmc**      
                        **!changemc**   
                        **!renamemc**   
                        **!changemcip** `,
                    inline: true
                },
                {
                    name: 'function',
                    value:
                        ` - tracks mc server status, refreshes every 5 minutes
                      - lists all mc servers and their respective IPs
                      - adds server to registered server list
                      - deletes server from registered server list
                      - changes the server being tracked by !mc
                      - changes an existing server's name
                      - changes an existing server's IP address`,
                    inline: true
                },
            )
            .setColor("#F5F5F5")

        // create embed for gt commands
        const gtEmbed = new MessageEmbed()
            .setTitle("gt elp")
            .setDescription(
                `**All commands are preceded by an !**
                gt commands involve creating editing scheduled events.
                users can accept, decline, or sign-up as "tentative"`
            )
            .addFields(
                {
                    name: 'gt commands',
                    value:
                        `>>> **!gt**    
                        **!changegame**   
                        **!changetime**      
                        **!changetitle**`,
                    inline: true
                },
                {
                    name: 'function',
                    value:
                        ` - initiates gamer time event
                      - changes gamer game and resends invitation
                      - changes gamer time and resends invitation
                      - changes event title and resends invitation`,
                    inline: true
                },
            )
            .setColor("#F5F5F5")
            .setFooter('Created by Dogbert', 'https://i.ytimg.com/vi/ZLZTZSN0AnE/maxresdefault.jpg')


            // select menu collector and collection handling
            const filter = i => i.user.id === message.author.id;
            const collector = message.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 }); // componentType: 'SELECT_MENU',
       
            await preventInteractionCollision(message, collector, sent)
    
            collector.on('collect', async i => {
                var send, update;
                if (i.values == 'mc') {
                    console.log('mc elp requested');
                    send = message.channel.send({ embeds: [mcEmbed] });
                    update = i.update({ content: 'mc elp requested', components: [] });
                }
                else {
                    console.log('gt elp requested');
                    send = message.channel.send({ embeds: [gtEmbed] });
                    update = i.update({ content: 'gt elp requested', components: [] });
                }
                Promise.all([send, update])
            });
    
            collector.on('end', async collected => {
                console.log(`elp collected ${collected.size} menu selections`)
                if (collected.size == 0) await sent.edit({ content: 'Request Timeout', ephemeral: true, components: [] })
            });
    
            cmdStatus = 0;
    }
}
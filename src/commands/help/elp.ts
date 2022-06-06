import {Command} from "../../dependencies/classes/Command";
import {MessageActionRow, MessageButton, MessageEmbed} from "discord.js";

export const elp = new Command(
    'elp', 
    'lists all commands and relevant information', 
    async (client, interaction) => {
    // Generate buttons
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('prev')
                .setLabel('Prev')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle('SECONDARY'),
        )

    // embed for mc commands
    const mcEmbed = new MessageEmbed()
        .setTitle("minecraft commands")
        .setDescription(
            `**Use the buttons to navigate between command pages. Visit the [github](https://github.com/MykelMatar/Dogbot) page for more information about command status**`
        )
        .addFields(
            {
                name: 'command',
                value:
                    `**/mc-server-status**    
                    **/mc-change-server**   
                    **/mc-list-servers**      
                    **/mc-add-server**      
                    **/mc-change-server-ip**   
                    **/mc-change-server-name**   
                    **/mc-delete-server** `,
                inline: true
            },
            {
                name: 'function',
                value: 
                    `- tracks mc server status
                  - changes the server being tracked 
                  - lists all servers and their respective IPs
                  - adds server to registered server list
                  - changes an existing server's IP address
                  - changes an existing server's name
                  - deletes server from registered server list`,
                inline: true
            },
        )
        //.setColor("#F5F5F5")
        .setColor("#8570C1")
        .setFooter({text: 'Page 1'})

    // embed for role commands
    const roleEmbed = new MessageEmbed()
        .setTitle("role commands")
        .setDescription(
            `**Use the buttons to navigate between command pages. Visit the [github](https://github.com/MykelMatar/Dogbot) page for more information about command status**`
        )
        .addFields(
            {
                name: 'command',
                value:
                    `**/role-selection-menu**    
                    **/setrole-default**   
                    **/clearrole-default** 
                    **/set-welcome-channel**`,
                inline: true
            },
            {
                name: 'function',
                value:
                    `- creates dropdown menu for users to select roles
                  - changes the role given to new users
                  - removes default role given to new users
                  - sets the channel for Dogbot to detect users joining`,
                inline: true
            },
        )
        .setColor("#8570C1")
        .setFooter({text: 'Page 2'})

    // embed for enlist commands
    const enlistEmbed = new MessageEmbed()
        .setTitle("enlist commands")
        .setDescription(
            `**Use the buttons to navigate between command pages. Visit the [github](https://github.com/MykelMatar/Dogbot) page for more information about command status**`
        )
        .addFields(
            {
                name: 'command',
                value:
                    `**/enlist-users**
                    **/enlist-stats**    
                    **/setrole-autoenlist**   
                    **/clearrole-autoenlist**`,
                inline: true
            },
            {
                name: 'function',
                value:
                    `- creates interaction to enlist other users for event/group
                  - shows user stats relevant to the enlist-users prompt 
                  - changes the role used to enlist (for auto enlisting)
                  - clears role used to automate enlisting`,
                inline: true
            },
        )
        .setColor("#8570C1")
        .setFooter({text: 'Page 3'})

    // embed for get_stats commands
    const statsEmbed = new MessageEmbed()
        .setTitle("get-stats commands")
        .setDescription(
            `**Use the buttons to navigate between command pages. Visit the [github](https://github.com/MykelMatar/Dogbot) page for more information about command status**`
        )
        .addFields(
            {
                name: 'command',
                value:
                    `**/get-stats-valorant**`,
                inline: true
            },
            {
                name: 'function',
                value:
                    `- retrieves Valorant stats from tracker.gg`,
                inline: true
            },
        )
        .setColor("#8570C1")
        .setFooter({text: 'Page 4'})

    // embed for get_stats commands
    const gamesEmbed = new MessageEmbed()
        .setTitle("game commands")
        .setDescription(
            `**Use the buttons to navigate between command pages. Visit the [github](https://github.com/MykelMatar/Dogbot) page for more information about command status**`
        )
        .addFields(
            {
                name: 'command',
                value:
                    `**/magic8**
                    **/tictactoe**
                    **/typingrace**`,
                inline: true
            },
            {
                name: 'function',
                value:
                    `- Responds to a prompt via a magic 8-ball
                    - starts a tictactoe game against another user
                    - creates a typing race between different users`,
                inline: true
            },
        )
        .setColor("#8570C1")
        .setFooter({text: 'Page 5'})

    const embeds = [mcEmbed, roleEmbed, enlistEmbed, statsEmbed, gamesEmbed] // array for indexing pages
    let pageNumber = 0;

    await interaction.reply({ephemeral: true, embeds: [embeds[pageNumber]], components: [row]}); // send mc embed as home page

    // create collector
    const filter = i => i.user.id === interaction.member.user.id;
    const collector = interaction.channel.createMessageComponentCollector({filter, componentType: 'BUTTON'}); // only message author can interact, 5s timer

    // collect response
    collector.on('collect', async i => {
        await i.deferUpdate()
        if (i.customId === 'next') {
            if (pageNumber < embeds.length - 1) pageNumber++
        }
        if (i.customId === 'prev') {
            if (pageNumber > 0) pageNumber--
        }
        await interaction.editReply({ embeds: [embeds[pageNumber]], components: [row]}); // send mc embed as home page
    });
})
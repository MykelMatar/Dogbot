const {MessageActionRow, MessageButton, MessageEmbed} = require("discord.js");
const {contents} = require("cheerio/lib/api/traversing");

module.exports = {
    name: 'typingrace',
    description: 'creates typingrace game to play with friends',
    async execute(client, interaction, guildName) {
        console.log(`typingrace requested by ${interaction.member.user.username}`)

        // prompt to join race with 'join' button
        const embed = new MessageEmbed()
            .setTitle("Registered MC Racers")
            .addField('Users', '-')
            .setColor("#8570C1")
        
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('joinrace')
                    .setLabel('Join')
                    .setStyle('PRIMARY'),
            )

        interaction.reply({ content: 'Typing race initiated. Would you like to participate?', components: [row] })

        let racers = ['-']
        const collector = interaction.channel.createMessageComponentCollector({componentType: 'BUTTON', time: 120000}); // 2 min

        collector.on('collect', async i => {
            await i.deferUpdate() // prevents "this interaction failed" message from appearing

            if (i.customId === 'joinrace') {
                if (!racers.includes('> ' + i.user.username + '\n')) racers.push('> ' + i.user.username + '\n') // checks if user is in array 1 before adding them
                if (racers.length > 1 && racers.includes('-')) {  //removes extra dash if a user is in the array
                    racers.splice(racers.indexOf('-'), 1)
                }
            }
            embed.fields[0].value = racers.join(''); // convert array into string seperated by spaces bc discord js 13 requires strings
            await interaction.editReply({ content: 'Typing race initiated. Would you like to participate?', embeds: [embed], components: [row] });
        });
        
        collector.on('end', async collected => {
            await interaction.editReply({content: 'Race Starting', embeds: [embed], components: []})
            // send 3,2,1, then send random prompt
            // log user responses, filter by users that joined
            // check prompt, log WPM and accuracy and relevant stats
            // wait for all user submissions (or 2 min), then compare WPMs and rank
        })
    }
}
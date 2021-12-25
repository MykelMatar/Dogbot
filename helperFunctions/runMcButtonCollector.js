/**
 * collection and interaction handling
 * @param  {string} client
 * @param  {string} message
 * @param  {string} args
 * @param  {string} guildName
 */
 function runMcButtonCollector(client, message, args, guildName, sent) {
    const filter = i => i.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', max: 1, time: 10000 }); // only message author can interact, 1 response, 10s timer 
    const command1 = client.commands.get('changemc');
    const command2 = client.commands.get('listmc');
  
    
    collector.on('collect', async i => {
        var update, execute;
      if (i.customId === 'Change') {
        update = i.update({ content: 'Server Change Requested', components: []});
        execute = command1.execute(client, message, args, guildName);
      }
      else if (i.customId === 'List') {
        update = i.update({ content: 'Server List Requested', components: []});
        execute = command2.execute(client, message, args, guildName);
      }
      Promise.all([update, execute])
    });
  
    collector.on('end', async collected => {
        if (collected.size == 1) console.log('button pressed');
        else {
            console.log('no button pressed')
            await sent.edit({ ephemeral: true, embeds: [sent.embeds[0]], components: [] })  // remove buttons
        };
    });
    
  }

  module.exports = runMcButtonCollector;
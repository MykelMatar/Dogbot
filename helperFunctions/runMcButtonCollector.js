/**
 * collection and interaction handling for !mc
 * @param  {string} client
 * @param  {string} message
 * @param  {string} args
 * @param  {string} guildName
 */
function runMcButtonCollector(client, message, args, guildName, sent) {
  const filter = i => i.user.id === message.author.id;
  const collector = message.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', max: 1, time: 10000 }); // only message author can interact, 1 response, 10s timer 
  const msgCollector = message.channel.createMessageCollector({ time: 10000 })
  const command1 = client.commands.get('changemc');
  const command2 = client.commands.get('listmc');

  /** 
   * prevent other button interactions occuring simultaneously 
   * not using preventInteractionCollision because that function rewrites the last sent message to indicate an aborted command.
   * this is not a behavior we want for !mc or !listmc since they display pertinent information
   */ 
  msgCollector.on('collect', async m => {
    if (m.content == '!listmc') {
      msgCollector.stop();
      collector.stop();
      await sent.edit({ ephemeral: true, components: [] })
    }
  });

  collector.on('collect', async i => {
    var update, execute;
    if (i.customId === 'Change') {
      update = i.update({ content: 'Server Change Requested', components: [] });
      execute = command1.execute(client, message, args, guildName);
    }
    else if (i.customId === 'List') {
      update = i.update({ content: 'Server List Requested', components: [] });
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
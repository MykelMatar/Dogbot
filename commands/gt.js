const { MessageEmbed } = require('discord.js');
const { clearInterval } = require('timers');
const Str = require('@supercharge/strings')
const data = require('../data.json');
const Timer = require('dayjs')
const fs = require('fs');
const { isString } = require('@supercharge/strings');



module.exports = {
    name: 'gt',
    description: "Schedules Gamer Time and sends reactions for collection",
    async execute(client, message, args, guildName) {
        let EmbedID = data.Guilds[guildName].EmbedData["id"];
        unpinEmbed(message, EmbedID);

        //Argument Handling
        if (!args[0] || !args[1] || !args[2]) return message.reply("Missing Argument. Command Format: !gt {game} {time in 'hours:minutes' format} {am / pm}}")
        else if (!isString(args[0])) return message.reply("Game must be a string.")
        else {
            let game = args[0];
            var hours = args[1];
            var ampm = args[2];


            // !gt Embed creation
            const Embed = new MessageEmbed()
                .setTitle("Gamer Time")
                .setDescription("Please react to RSVP for Gamer Time, or if you would like to change any details, use !cummands for more commands")
                .addFields(
                    { name: "Game:", value: game },
                    { name: "Time", value: args[1] + ' ' + ampm },
                    { name: printEmoji1(message, guildname) + " Forsureforsure", value: '-', inline: true },
                    { name: printEmoji2(message, guildname) + " mayhaps", value: '-', inline: true },
                    { name: printEmoji3(message, guildname) + " no", value: '-', inline: true }
                )
                .setColor("#19e2e4")
                //.setThumbnail('https://i.ytimg.com/vi/ZLZTZSN0AnE/maxresdefault.jpg')
                .setImage('https://i.ytimg.com/vi/ZLZTZSN0AnE/maxresdefault.jpg')
                .setFooter('Created by Dogbert & Ziploc')

            //var modCheckID = message.guild.emojis.resolve('852735711789842443'); //remove this line and the line below if used in another server
            //var modCheck = modCheckID.toString()
            //message.channel.send(`<@&${'69321489329317482'}> `); //@gamers :modcheck:
            message.channel.send({ embeds: [Embed] });

            //edit variables for use in function
            var hours = Str(args[1]).before(':').get();
            hours = parseInt(hours);
            var minutes = Str(args[1]).after(':').get();
            minutes = parseInt(minutes);

            //timer for collector
            //let timer = getTimer(message, guildname, hours, minutes, ampm);
            //setTimeout(() => message.channel.send({content:"gamer time")}, timer);

            //Pushing Embed data to json file
            data.Guilds[guildname].EmbedData.Title = Embed.title;
            data.Guilds[guildname].EmbedData.Fields["Game"] = Embed.fields[0].value; //field[0] = game
            data.Guilds[guildname].EmbedData.Fields["Time"] = Embed.fields[1].value; //field[1] = time
           // data.Guilds[guildname].EmbedData.Fields["Timer"] = timer; // timer
            writeToJson(data);
        }
    }
}



//Collector + Helper Functions



//!gt reaction collector
function runGTReactionCollector(message, guildname) {
    if (message.author.bot && message.embeds[0].title == "Gamer Time") {
       // let timer =
        //    parseInt(data.Guilds[guildname].EmbedData.Fields["Timer"]); //retrieves timer from json
        let time = data.Guilds[guildname].EmbedData.Fields["Time"]; //retrieves embed time parameter from json file
        let game = data.Guilds[guildname].EmbedData.Fields["Game"]; //retrieves embed game parameter from json file
        var gamer = []; //declares gamer array to be used throughout this entire scope

        //retrieves emoji data for reaction
        let emoji1Id = data.Guilds[guildname].EmojiData["0"];
        let emoji2Id = data.Guilds[guildname].EmojiData["1"];
        let emoji3Id = data.Guilds[guildname].EmojiData["2"];
        message.react(emoji1Id); //reacts to embed with emoji
        message.react(emoji2Id);
        message.react(emoji3Id);


        //filter to ensure no other reactions are counted
        const filter = (reaction, user) => {
            if (user.id != client.user.id) {
                if (reaction.emoji.id == null) {
                    return reaction.emoji.name;
                } else {
                    return reaction.emoji.id;
                }
            }
        };


        //collector creation
        const collector = message.createReactionCollector(filter, { time: 10000, dispose: true });
        var gamertags1 = ['-'];
        var gamertags2 = ['-'];
        var gamertags3 = ['-'];

        //start of collection
        collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
            gamer.push(user.id);



            //edit embed to sort people into respective categories
            const recievedEmbed = message.embeds[0];
            const newEmbed = new MessageEmbed(recievedEmbed) //creates new embed to edit existing embed


            //when someone reacts, add them to the corresponding reaction array and remove them from the other two
            if (reaction.emoji == getEmoji1(message, guildname) || reaction.emoji.name == getEmoji1(message, guildname)) {
                if (!gamertags1.includes("> " + user.username)) { gamertags1.push("> " + user.username) } //checks if user is already in array
                if (gamertags2.includes("> " + user.username)) { gamertags2.splice(gamertags2.indexOf("> " + user.username), 1) } //removes user from other 2 arrays to ensure there are no duplicates
                if (gamertags3.includes("> " + user.username)) { gamertags3.splice(gamertags3.indexOf("> " + user.username), 1) }
                if (!(gamertags2.includes('-')) && gamertags2.length == 0) { gamertags2.push('-') } //makes sure array 2 is never empty
                if (!(gamertags3.includes('-')) && gamertags3.length == 0) { gamertags3.push('-') } //makes sure array 3 is never empty
                if (gamertags1.length > 1 && gamertags1.includes('-')) {  //removes extra dash if a user is in the array
                    gamertags1.splice(gamertags1.indexOf('-'), 1)
                }
            }
            if (reaction.emoji == getEmoji2(message, guildname) || reaction.emoji.name == getEmoji2(message, guildname)) {
                if (!gamertags2.includes("> " + user.username)) { gamertags2.push("> " + user.username) } //checks if user is already in array
                if (gamertags1.includes("> " + user.username)) { gamertags1.splice(gamertags1.indexOf("> " + user.username), 1) } //removes user from other 2 arrays to ensure there are no duplicates
                if (gamertags3.includes("> " + user.username)) { gamertags3.splice(gamertags3.indexOf("> " + user.username), 1) }
                if (!(gamertags1.includes('-')) && gamertags1.length == 0) { gamertags1.push('-') } //makes sure array 1 is never empty
                if (!(gamertags3.includes('-')) && gamertags3.length == 0) { gamertags3.push('-') } //makes sure array 3 is never empty
                if (gamertags2.length > 1 && gamertags2.includes('-')) {  //removes extra dash if a user is in the array
                    gamertags2.splice(gamertags2.indexOf('-'), 1)
                }
            }
            if (reaction.emoji == getEmoji3(message, guildname) || reaction.emoji.name == getEmoji3(message, guildname)) {
                if (!gamertags3.includes("> " + user.username)) { gamertags3.push("> " + user.username) } //checks if user is already in array
                if (gamertags2.includes("> " + user.username)) { gamertags2.splice(gamertags2.indexOf("> " + user.username), 1) } //removes user from other 2 arrays to ensure there are no duplicates
                if (gamertags1.includes("> " + user.username)) { gamertags1.splice(gamertags1.indexOf("> " + user.username), 1) }
                if (!(gamertags1.includes('-')) && gamertags1.length == 0) { gamertags1.push('-') } //makes sure array 1 is never empty
                if (!(gamertags2.includes('-')) && gamertags2.length == 0) { gamertags2.push('-') } //makes sure array 2 is never empty
                if (gamertags3.length > 1 && gamertags3.includes('-')) { //removes extra dash if a user is in the array
                    gamertags3.splice(gamertags3.indexOf('-'), 1)
                }
            }
            newEmbed.fields[2] = { name: printEmoji1(message, guildname) + " Forsureforsure", value: gamertags1, inline: true };
            newEmbed.fields[3] = { name: printEmoji2(message, guildname) + " mayhaps", value: gamertags2, inline: true };
            newEmbed.fields[4] = { name: printEmoji3(message, guildname) + " no", value: gamertags3, inline: true };
            reaction.users.remove(user);
            message.edit({ embeds: [Embed] });
        });

        //deletes user from collection when reaction is removed
        collector.on('remove', (reaction, user) => {
            console.log('removed')
        });

        //ends collector
        collector.on('end', (collected) => {
            message.pin();
            data.Guilds[guildname].EmbedData["id"] = message.id;
            writeToJson(data);
            //setJsonData(data);
        });
    }
}


// function getTimer(message, guildname, getHours, getMinutes, getAmpm) {

//     //retrieve current time and declare hour Left variable for us in if statement
//     hours = getHours;
//     minutes = getMinutes;
//     ampm = getAmpm;
//     var hoursLeft;
//     currentHour = dateToPDT(Timer);
//     currentMinutes = Timer.getMinutes();
//     if (hours == '12') {
//         hours = '00';
//         hoursLeft = hours - currentHour
//     }
//     if (ampm == "pm") {
//         hours += 12;
//         hoursLeft = hours - currentHour;
//     }
//     let minutesLeft = minutes - currentMinutes;
//     let timeLeft = ((hoursLeft * 60) + minutesLeft); //converts to minutes
//     var timer = timeLeft * 60000 //convert to ms for use as timer
//     console.log(timeLeft);
//     console.log(timer);
//     return timer;
// }


//getEmoji functions
function getEmoji1(message, guildname) {
    let emoji1Id = data.Guilds[guildname].EmojiData["0"];
    var emoji1;
    if (Number.isInteger(parseInt(emoji1Id))) {
        let resolveEmoji1 = message.guild.emojis.resolve(emoji1Id);
        emoji1 = resolveEmoji1
    } else { emoji1 = emoji1Id }

    return emoji1;
}

function getEmoji2(message, guildname) {
    let emoji2Id = data.Guilds[guildname].EmojiData["1"];
    var emoji2;
    if (Number.isInteger(parseInt(emoji2Id))) {
        let resolveEmoji2 = message.guild.emojis.resolve(emoji2Id);
        emoji2 = resolveEmoji2
    } else { emoji2 = emoji2Id }

    return emoji2;
}

function getEmoji3(message, guildname) {
    let emoji3Id = data.Guilds[guildname].EmojiData["2"];
    var emoji3;
    if (Number.isInteger(parseInt(emoji3Id))) {
        let resolveEmoji3 = message.guild.emojis.resolve(emoji3Id);
        emoji3 = resolveEmoji3
    } else { emoji3 = emoji3Id }

    return emoji3;
}

//print emoji functions for use in embed
function printEmoji1(message, guildname) {
    let emoji1Id = data.Guilds[guildname].EmojiData["0"];
    var emoji1;
    if (Number.isInteger(parseInt(emoji1Id))) {
        let resolveEmoji1 = message.guild.emojis.resolve(emoji1Id);
        emoji1 = resolveEmoji1.toString();
    } else { emoji1 = emoji1Id }

    return emoji1;
}

function printEmoji2(message, guildname) {
    let emoji2Id = data.Guilds[guildname].EmojiData["1"];
    var emoji2;
    if (Number.isInteger(parseInt(emoji2Id))) {
        let resolveEmoji2 = message.guild.emojis.resolve(emoji2Id);
        emoji2 = resolveEmoji2.toString();
    } else { emoji2 = emoji2Id }

    return emoji2;
}

function printEmoji3(message, guildname) {
    let emoji3Id = data.Guilds[guildname].EmojiData["2"];
    var emoji3;
    if (Number.isInteger(parseInt(emoji3Id))) {
        let resolveEmoji3 = message.guild.emojis.resolve(emoji3Id);
        emoji3 = resolveEmoji3.toString();
    } else { emoji3 = emoji3Id }

    return emoji3;
}

async function unpinEmbed(message, embedId) {
    if (embedId != null) {
        // (await message.channel.messages.fetch(embedId)).unpin();
    }
}

//writes to data.json
function writeToJson(data) {
    fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}
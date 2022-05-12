const data = require('../../data.json');
const fs = require('fs');  

module.exports = async function(client, guild) {
    console.log(`Dogbot added to ${guild.name}`);
    if (!("Guilds" in data)) {
        const gData = {
            Guilds: {}
        };
        writeToJson(gData);
    }

    let guildName = guild.name.replace(/\s+/g, ""); //removes whitespace from string
    data.Guilds[guildName] = {
        ServerData: {
            serverId: guild.id,
            welcomeChannel: null,
            roles: {
                autoenlist: null,
                default: null
            }
        },
        MCData: {
            serverList: {},
            selectedServer: {
                title: "",
                IP: ""
            }
        },
        UserData: {}
    };
    writeToJson(data);
}



//writes to data.json
function writeToJson(data) {
    fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}
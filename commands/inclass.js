const fs = require('fs');
const { google } = require('googleapis');
const getAccessToken = require('../helperFunctions/getAccessToken');
const TOKEN_PATH = process.env.google_token;
//const authorize = require('../helperFunctions/authorize');






module.exports = {
    name: 'inclass', 
    description: 'returns current users who are in class, and until what time', 
    async execute(client, message, args, guildName){

        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            authorize(JSON.parse(content), listEvents);
          });

    }
}

// TODO: retrieve ongoing events, create embed of said events with their end times like: title - ongoing events, fields - user is in class until x:yz

function listEvents(auth, message) {
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list({
        calendarId: 'r1c90mg4jl8hc69pvfd054lhm0@group.calendar.google.com',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime', 
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        if (events.length) {
            console.log('Upcoming 10 events:');
            let start = new Date().toISOString();
            let end = new Date().toISOString();
            for (let i = 0; i < events.length; i++) {
                start = events.start;
                end = events.end;
                console.log(start + end);
            }
            // events.map((event, i) => {
            //     const start = event.start.dateTime || event.start.date;
            //     console.log(`${start} - ${event.summary}`);
            // });
        } else {
            console.log('No ongoing events.');
            message.reply('No one is in class')
        }
    });
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}



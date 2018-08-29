/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var https = require('https');
var _ = require('lodash');

var $cards = require('./cards');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var inMemoryStorage = new builder.MemoryBotStorage();

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', inMemoryStorage);

bot.dialog('/', function (session) {

    var card = $cards.greetingCard({firstName: "Thomas"});

    var msg = new builder.Message(session)
        .addAttachment({
            contentUrl: 'https://teama1storage.blob.core.windows.net/scratchbot-85a/03-Quiggles-CS-tilt-eyeClosed.png',
            contentType: 'image/png',
            name: 'BotFrameworkOverview.png'
        });

    session.send(msg);
    
    //var msg = new builder.Message(session).addAttachment(card);
    //session.send(msg);
});
 

function processSubmitAction(session, value) {
    var defaultErrorMessage = 'Please complete all the search parameters';
    console.log("processSubmitAction " + value.type);
    switch (value.type) {
        case 'initiateHealthKitQuery':
            session.beginDialog('/initiateHealthKitQuery');
            break;

        case 'medicalDataSearch':
            session.beginDialog('/waiting');
            searchFhir();
            break;

        case 'wantToLearnMore':
            session.beginDialog('/want-to-learn-more-card', value);
            break;

        

        default:
            // A form data was received, invalid or incomplete since the previous validation did not pass
            session.send(defaultErrorMessage);
    }
}

        



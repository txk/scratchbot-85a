/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var https = require('https');

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

__hack_resp = undefined;

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

//var tableName = 'botdata';
//var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
//var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

var inMemoryStorage = new builder.MemoryBotStorage();

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', inMemoryStorage);

bot.dialog('/', function (session) {

    if (session.message && session.message.value) {
        // A Card's Submit Action obj was received
        processSubmitAction(session, session.message.value);
        return;
    }
    //session.send('You said LOCAL 3: ' + session.message.text);

    // Display Welcome card with Hotels and Flights search options
    // var card = {
    //     'contentType': 'application/vnd.microsoft.card.adaptive',
    //     'content': {
    //         '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
    //         'type': 'AdaptiveCard',
    //         'version': '1.0',
    //         'body': [
    //             {
    //                 'type': 'Container',
    //                 'speak': '<s>Hello!</s><s>I am Quiggly and can help you find you personalized health tests. Want to you want to do?</s>',
    //                 'items': [
    //                     {
    //                         'type': 'ColumnSet',
    //                         'columns': [
    //                             {
    //                                 'type': 'Column',
    //                                 'size': 'auto',
    //                                 'items': [
    //                                     {
    //                                         'type': 'Image',
    //                                         'url': 'https://teama1storage.blob.core.windows.net/scratchbot-85a/Quiggles-CS.PNG',
    //                                         'size': 'medium',
    //                                         'style': 'person'
    //                                     }
    //                                 ]
    //                             },
    //                             {
    //                                 'type': 'Column',
    //                                 'size': 'stretch',
    //                                 'items': [
    //                                     {
    //                                         'type': 'TextBlock',
    //                                         'text': 'Hello!',
    //                                         'weight': 'bolder',
    //                                         'isSubtle': true
    //                                     },
    //                                     {
    //                                         'type': 'TextBlock',
    //                                         'text': 'Are you looking for a Quest location or a Lab Test?',
    //                                         'wrap': true
    //                                     }
    //                                 ]
    //                             }
    //                         ]
    //                     },
    //                     {
    //                         'type': 'ColumnSet',
    //                         'columns': [
    //                             {
    //                                 'type': 'Column',
    //                                 'size': 'auto',
    //                                 'items': [
    //                                     {
    //                                         'type': 'Image',
    //                                         'url': 'https://teama1storage.blob.core.windows.net/scratchbot-85a/Quiggles-CS.PNG',
    //                                         'size': 'medium',
    //                                         'style': 'person'
    //                                     }
    //                                 ]
    //                             },
    //                             {
    //                                 'type': 'Column',
    //                                 'size': 'stretch',
    //                                 'items': [
    //                                     {
    //                                         'type': 'TextBlock',
    //                                         'text': 'Hello!',
    //                                         'weight': 'bolder',
    //                                         'isSubtle': true
    //                                     },
    //                                     {
    //                                         'type': 'TextBlock',
    //                                         'text': 'Are you looking for a Quest location or a Lab Test?',
    //                                         'wrap': true
    //                                     }
    //                                 ]
    //                             }
    //                         ]
    //                     }

    //                 ]
    //             }
    //         ],
    //         'actions': [
    //             // Hotels Search form
    //             {
    //                 'type': 'Action.ShowCard',
    //                 'title': 'Quest location',
    //                 'speak': '<s>Quest location</s>',
    //                 'card': {
    //                     'type': 'AdaptiveCard',
    //                     'body': [
    //                         {
    //                             'type': 'TextBlock',
    //                             'text': 'Welcome to the Hotels finder!',
    //                             'speak': '<s>Welcome to the Hotels finder!</s>',
    //                             'weight': 'bolder',
    //                             'size': 'large'
    //                         },
    //                         {
    //                             'type': 'TextBlock',
    //                             'text': 'Please enter your destination:'
    //                         },
    //                         {
    //                             'type': 'Input.Text',
    //                             'id': 'destination',
    //                             'speak': '<s>Please enter your destination</s>',
    //                             'placeholder': 'Miami, Florida',
    //                             'style': 'text'
    //                         },
    //                         {
    //                             'type': 'TextBlock',
    //                             'text': 'When do you want to check in?'
    //                         },
    //                         {
    //                             'type': 'Input.Date',
    //                             'id': 'checkin',
    //                             'speak': '<s>When do you want to check in?</s>'
    //                         },
    //                         {
    //                             'type': 'TextBlock',
    //                             'text': 'How many nights do you want to stay?'
    //                         },
    //                         {
    //                             'type': 'Input.Number',
    //                             'id': 'nights',
    //                             'min': 1,
    //                             'max': 60,
    //                             'speak': '<s>How many nights do you want to stay?</s>'
    //                         }
    //                     ],
    //                     'actions': [
    //                         {
    //                             'type': 'Action.Submit',
    //                             'title': 'Search',
    //                             'speak': '<s>Search</s>',
    //                             'data': {
    //                                 'type': 'hotelSearch'
    //                             }
    //                         }
    //                     ]
    //                 }
    //             },
    //             {
    //                 'type': 'Action.ShowCard',
    //                 'title': 'Lab Tests',
    //                 'speak': '<s>Lab Tests</s>',
    //                 'card': {
    //                     'type': 'AdaptiveCard',
    //                     'body': [
    //                         {
    //                             'type': 'TextBlock',
    //                             'text': 'Flights is not implemented =(',
    //                             'speak': '<s>Flights is not implemented</s>',
    //                             'weight': 'bolder'
    //                         }
    //                     ]
    //                 }
    //             }
    //         ]
    //     }
    // };
    var card = greeting_card();

    var msg = new builder.Message(session)
        .addAttachment(card);
    session.send(msg);
});

function processSubmitAction(session, value) {
    var defaultErrorMessage = 'Please complete all the search parameters';
    switch (value.type) {
        case 'medicalDataSearch':
            session.beginDialog('/data-waiting-card', value);
            break;

        default:
            // A form data was received, invalid or incomplete since the previous validation did not pass
            session.send(defaultErrorMessage);
    }
}

bot.dialog('/data-received', function (session) {       
    session.send("Received patient data: " + JSON.stringify(__hack_resp));
});

bot.dialog('/data-waiting', function (session) {       
    session.send("Waiting for your upload ... " + __hack.num);
    session.send(__hack.body);
});

bot.dialog('/data-waiting-card', function (session) {  
    var card =  createHeroCard(session);
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
});

function createAnimationCard(session) {
    return new builder.AnimationCard(session)
        .title('Microsoft Bot Framework')
        .subtitle('Animation Card')
        .image(builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png'))
        .media([
            { url: 'https://teama1storage.blob.core.windows.net/scratchbot-85a/light_progress2.gif' }
        ]);
}

function createAdaptiveCard(session) {
   var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            
            'body': [
                {
                    'type': 'ImageSet',
                    'images': [
                        {
                            'type': 'Image',
                            'url': 'https://teama1storage.blob.core.windows.net/scratchbot-85a/light_progress2.gif'
                        }
                    ]
                }]
        }
                           
   };
   return card;
}

function createHeroCard(session) {
    return new builder.HeroCard(session)
        .title('Quiggles')
        .images([
            builder.CardImage.create(session, 'https://teama1storage.blob.core.windows.net/scratchbot-85a/light_progress2.gif')
        ]);
}


function greeting_card() {

    var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            'body': [
                {
                    'type': 'Container',
                    'speak': '<s>Hello!</s><s>I am Quiggly and can help you find you personalized health tests. Want to you want to do?</s>',
                    'items': [
                        {
                            'type': 'ColumnSet',
                            'columns': [
                                {
                                    'type': 'Column',
                                    'size': 'auto',
                                    'items': [
                                        {
                                            'type': 'Image',
                                            'url': 'https://teama1storage.blob.core.windows.net/scratchbot-85a/Quiggles-CS.PNG',
                                            'size': 'medium',
                                            'style': 'person'
                                        }
                                    ]
                                },
                                {
                                    'type': 'Column',
                                    'size': 'stretch',
                                    'items': [
                                        {
                                            'type': 'TextBlock',
                                            'text': 'Hello Joann!',
                                            'size': 'large',
                                            'weight': 'bolder',
                                            'isSubtle': true
                                        },
                                        {
                                            'type': 'TextBlock',
                                            'size': 'large',
                                            'text': 'I am Quiggly and can help you find health tests that fit your personal profile. Just let me know.',
                                            'wrap': true
                                        }
                                    ]
                                }
                            ]
                        }

                    ]
                }
            ],
            'actions': [
                {
                    'type': 'Action.ShowCard',
                    'title': 'Yes. I want to learn more',
                    'speak': '<s>Yes. I want to learn more</s>',
                    'card': {
                        'type': 'AdaptiveCard',
                        'body': [
                            {
                                'type': 'TextBlock',
                                'size': 'large',
                                'text': 'If you allow me to query of the medical data associated with your account, I can match your profile data against our vast data repository ...',
                                'wrap': true
                            }
                        ],
                        'actions': [
                            {
                                'type': 'Action.Submit',
                                'title': 'Yes. Continue.',
                                'speak': '<s>Yes. Continue.</s>',
                                'data': {
                                    'type': 'medicalDataSearch'
                                }
                            }
                        ]
                    }
                }
            ]
        }
    };
    return card;

}

bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                startChat(message.address);
            }
        });
    }
});



function startChat(address) {
    bot.beginDialog(address, '/');
    //waitForData(address);
}


__hack = {};


function waitForData(address) {
  //__hack.intervalId = setInterval(callCortana, 2000, address);
  callCortana(address);
}

function callCortana(address) {
    
  var req = {
    host: 'cortana-ai-chatbot-api.azurewebsites.net',
    path: '/ai/api/patient/health/v1/info',
    port: 443,
    headers: {'Authorization': 'Basic Y29ydGFuYTpQQHNzdzByZDEwMQ=='}
  };
  
  https.get(req, function (res) {
    res.setEncoding('utf8');
    res.on('data', function(body) {
        //__hack_resp = body;
        //bot.beginDialog(address, '/');
        var all = body;
        __hack.num = all.length;
        __hack.body = all;
        bot.beginDialog(address, '/data-waiting-card');
    });
    
  });
}
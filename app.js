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

__hack_resp = undefined;

__hack = {};


// user
var user = {
    fhirId: '4322fec2-b90b-4618-b205-105749a0d6a0',
    lastName: 'Smith',
    firstName: 'John'
};

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

    var card = $cards.greetingCard({firstName: user.firstName});

    var msg = new builder.Message(session)
        .addAttachment(card);
    session.send(msg);
});

function processSubmitAction(session, value) {
    var defaultErrorMessage = 'Please complete all the search parameters';
    console.log("processSubmitAction " + value.type);
    switch (value.type) {
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

bot.dialog('/data-received', function (session) {       
    session.send("Received patient data");
    session.send("hack.num: " + __hack.num);
    session.send("hack.body: " + __hack.body);
    session.endDialog();
});

bot.dialog('/fhir-data-received', function (session, args, next) {
    args = args || {};
    var data = args.data;
    console.log("**** data: " + JSON.stringify(data));
    var card = $cards.patientPropertiesCard(data);
    //console.log("**** card: " + JSON.stringify(card));
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);

});

bot.dialog('/timeout', function (session) {       
    session.send("Timeout");
    session.endDialog();
});

bot.dialog('/data-waiting', function (session) {       
    session.send("Waiting for your upload ... " + __hack.num);
    session.send(__hack.body);
    session.endDialog();
});

bot.dialog('/data-waiting-card', function (session) {  

    // generate random name
    var num = Math.floor(Math.random() * Math.floor(1000));
    var lastName = "Smith" + num;

    
    var card =  createHeroCard(session, lastName);
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
    //session.endDialog();

    msg = "Waiting until you have posted a patient record with lastName '" + lastName + "' to the /ai/api/patient/health/v1/info endpoint";
    session.send(msg);

    // query cortana
    __hack.intervalId = setInterval(queryCortana, 6000, lastName);

});

bot.dialog('/waiting', function (session) {  
 
    var card =  $cards.progressBarCard();
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
    session.endDialog();
});

bot.dialog('/cortana-result', function (session) {  
    var card =  createResultCard(session);
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);f
    session.endDialog();

});

bot.dialog('/want-to-learn-more-card', function (session) {  
    var card =  $cards.wantToLearnMoreCard();
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
    session.endDialog();
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

function createHeroCard(session, lastName) {
    return new builder.HeroCard(session)
        .images([
            builder.CardImage.create(session, 'https://teama1storage.blob.core.windows.net/scratchbot-85a/light_progress2.gif')
        ]);
}



function createResultCard(session) {

    var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            'body': [
                {
                    'type': 'TextBlock',
                    'text': 'Got results',
                    'size': 'large'
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
                __hack.address = message.address;
            }
        });
    }
});





function startChat(address) {
    bot.beginDialog(address, '/');
    //waitForData(address);
}





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

function searchFhir() {
    var args = {
        params: {
            fhirId: user.fhirId
        }
    };

    httpReqQ('patientInfo', args).then(function(response) {
        var data = JSON.parse(response);
        delete data.deviceToken;
        delete data.id;
        bot.beginDialog(__hack.address, '/fhir-data-received', {data: data});
    });
}

//     var req = {
//     host: 'cortana-ai-chatbot-api.azurewebsites.net',
//     path: '/ai/api/fhir/v1/patient/4322fec2-b90b-4618-b205-105749a0d6a0',
//     port: 443,
//     headers: {'Authorization': 'Basic Y29ydGFuYTpQQHNzdzByZDEwMQ=='}
//   };
  
//   https.get(req, function (res) {
//     var data = '';
//     res.setEncoding('utf8');

//     res.on('data', function(body) {
//         data += body;
//     });


//     res.on('end', function() {
//         var all = JSON.parse(data);
//         console.log("********** all: " + data);
        
//         bot.beginDialog(__hack.address, '/fhir-data-received', {data: all});
//     });
//   });




// function queryCortana() {
//     bot.beginDialog(__hack.address, '/data-received');

// }
function queryCortana(lastName) {

  __hack.cortanaCallCount = __hack.cortanaCallCount ? __hack.cortanaCallCount + 1 : 1;

  if ( __hack.cortanaCallCount > 10*3) {
      //time out
      clearInterval(__hack.intervalId);
      __hack.cortanaCallCount = 0;
      bot.beginDialog(__hack.address, '/timeout');
      return;
  }
    
  var req = {
    host: 'cortana-ai-chatbot-api.azurewebsites.net',
    path: '/ai/api/patient/health/v1/info',
    port: 443,
    headers: {'Authorization': 'Basic Y29ydGFuYTpQQHNzdzByZDEwMQ=='}
  };
  
  https.get(req, function (res) {
    var data = '';
    res.setEncoding('utf8');

    res.on('data', function(body) {
        data += body;
    });


    res.on('end', function() {
        //__hack_resp = body;
        //bot.beginDialog(address, '/');
        var all = JSON.parse(data);

        // get last names of all 
        var lastNames = _.map(all, function(e) {
            return e.lastName;
        });
        __hack.num = all.length;
        __hack.body = JSON.stringify(lastNames);

        // if there is a lastName "lastName", we are done
        if ( _.find(all, function(e) {
            return e.lastName.toLowerCase() == lastName.toLowerCase();
        }) ) {
            clearInterval(__hack.intervalId);
            bot.beginDialog(__hack.address, '/data-received');
        }
    });
    
  });
}


/////////////////////////////////////////////////////////////////////
// http requests
var requestConfig = {
    patientInfo: {
         host: 'cortana-ai-chatbot-api.azurewebsites.net',
         pathParams: ['fhirId'],
         path: '/ai/api/fhir/v1/patient/{fhirId}',
         port: 443,
         headers: {'Authorization': 'Basic Y29ydGFuYTpQQHNzdzByZDEwMQ=='}
    }
};


function httpReqQ(config, args) {

    return new Promise(function (resolve) {

        var req = _.clone(requestConfig[config]);

        // iterate over request params and replace them with the args
        _.forEach(req.pathParams, function (pathParam) {
            req.path = req.path.replace('{' + pathParam + '}', args.params[pathParam]);
        });

        https.get(req, function (res) {
            var data = '';
            res.setEncoding('utf8');
            
            res.on('data', function(body) {
                data += body;
            });
            
            res.on('end', function() {
                resolve(data);
            });
        });
    });
}
        



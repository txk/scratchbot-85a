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


function spacer(session) {
    var msg = new builder.Message(session)
        .addAttachment({
            contentUrl: 'https://teama1storage.blob.core.windows.net/scratchbot-85a/spacer.png',
            contentType: 'image/png',
            name: 'BotFrameworkOverview.png'
        });

    session.send(msg);
}

bot.dialog('/', function (session) {

    if (session.message && session.message.value) {
        // A Card's Submit Action obj was received
        processSubmitAction(session, session.message.value);
        return;
    }
    //session.send('You said LOCAL 3: ' + session.message.text);

    var card = $cards.quiggles({header: 'Hello there, John.'});
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);

    var f = function() {
        greetingContinue(session);
    };

    setTimeout(f, 2000);

    
});

function greetingContinue(session) {
    var card = $cards.greetingCard({firstName: user.firstName});

    var msg = new builder.Message(session)
        .addAttachment(card);
    session.send(msg);
}



function processSubmitAction(session, value) {
    var defaultErrorMessage = 'Please complete all the search parameters';
    console.log("processSubmitAction " + value.type);
    switch (value.type) {
        case 'initiateHealthKitQuery':
            session.beginDialog('/initiateHealthKitQuery');
            break;

        // case 'medicalDataSearch':
        //     session.beginDialog('/waiting', {msg: '1 Querying your health data.'});
        //     searchFhir();
        //     break;

        case 'confirmedGreeting':
            session.beginDialog('/waiting', {msg: 'Querying your health data.'});
            searchFhir();
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

    // show Quiggles
    var card = $cards.quiggles({header: 'I DID IT!'});
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);

    var f = function() {
        fhirDataReceivedContinue(session, data);
    };

    setTimeout(f, 3000);

    //spacer(session);
    // card = $cards.patientPropertiesCard(data);
    // //console.log("**** card: " + JSON.stringify(card));
    // msg = new builder.Message(session).addAttachment(card);
    // // session.send("calling healthkit endpoint: " + data.deviceToken);
    // session.send(msg);

    // card = $cards.initiateHealthKitQueryCard(data);
    // msg = new builder.Message(session).addAttachment(card);
    // // session.send("calling healthkit endpoint: " + data.deviceToken);
    // session.send(msg);
    // session.endDialog();
});

function fhirDataReceivedContinue(session, data) {

    var card = $cards.patientPropertiesCard(data);
    //console.log("**** card: " + JSON.stringify(card));
    var msg = new builder.Message(session).addAttachment(card);
    // session.send("calling healthkit endpoint: " + data.deviceToken);
    session.send(msg);

    card = $cards.initiateHealthKitQueryCard(data);
    msg = new builder.Message(session).addAttachment(card);
    // session.send("calling healthkit endpoint: " + data.deviceToken);
    session.send(msg);
    session.endDialog();
}

bot.dialog('/initiateHealthKitQuery', function (session, args, next) {
    

     var args = {
        params: {
            deviceToken: user.fhirData.deviceToken
        }
    };

    //session.send("xxxx querying health kit for token: " + args.params);

    httpReqQ('callHealthKit', args).then(function(response) {
        //session.send("xxxx callHealthKit resolved: " + response);

        bot.beginDialog(__hack.address, '/data-waiting-card');
    });


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


bot.dialog('/healthKit-data-received', function (session, args) {       
    console.log("**** data: " + JSON.stringify(args));
    var data = _.omit(args, ['deviceToken', 'id']);
    var card = $cards.patientPropertiesCard(data);
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);

    // make a call to predictive analysis
    // var body = _.clone(user.fhirData);
    // body['patientUID'] = body.id;

    var args = {
        params: {
            fhirId: user.fhirId
        }
    };
    httpReqQ('callPredictiveAnalysis', args).then(function(response) {
        session.send("xxxx callPredictiveAnalysis resolved: " + response);
    });


});

bot.dialog('/healthKit-data-waiting', function (session) {       
    session.send("Still waiting for healthkit data ... " );
    session.endDialog();
});

 

bot.dialog('/data-waiting-card', function (session) {  
    var card =  $cards.progressBarCard({msg: 'Waiting for your Apple HealthKit upload'});
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
    session.endDialog();

    // pollHealthKit
    var args = {
        params: {
            fhirId: user.fhirId
        }
    };
    var f = function() {
        pollHealthKit(args);
    }
    __hack.intervalId = setInterval(f, 6000);

});

bot.dialog('/waiting', function (session, args) {  
 
    console.log("**** argsmsg: " + args.msg);
    var card =  $cards.progressBarCard(args);
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
    session.endDialog();
});


bot.dialog('/want-to-learn-more-card', function (session) {  
    var card =  $cards.wantToLearnMoreCard();
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
    session.endDialog();
});


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
        user.fhirData = data;
        data = _.pick(data, ['lastName', 'firstName', 'city', 'state', 'zip', 'height', 'weight']);
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




// function pollHealthKit() {
//     bot.beginDialog(__hack.address, '/data-received');

// }
function pollHealthKit(args) {

  __hack.cortanaCallCount = __hack.cortanaCallCount ? __hack.cortanaCallCount + 1 : 1;

  if ( __hack.cortanaCallCount > 10*3) {
      //time out
      clearInterval(__hack.intervalId);
      __hack.cortanaCallCount = 0;
      bot.beginDialog(__hack.address, '/timeout');
      return;
  }

  httpReqQ('pollHealthKit', args).then(function(response) {
      console.log("xxxx response: " + response);
      var data = JSON.parse(response);
      if ( data.healthKitStatus ) {
        user.fhirData = _.clone(data);
        clearInterval(__hack.intervalId);
        bot.beginDialog(__hack.address, '/healthKit-data-received', data);
      } 
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
         headers: {'Authorization': 'Basic Y29ydGFuYTpQQHNzdzByZDEwMQ=='},
         method: 'GET'
    },

    callHealthKit: {
         host: 'cortana-ai-chatbot-api.azurewebsites.net',
         pathParams: ['deviceToken'],
         path: '/ai/api/device/v1/shareHealthKit/{deviceToken}',
         port: 443,
         headers: {'Authorization': 'Basic Y29ydGFuYTpQQHNzdzByZDEwMQ=='},
         method: 'POST'
    },

    pollHealthKit: {
         host: 'cortana-ai-chatbot-api.azurewebsites.net',
         pathParams: ['fhirId'],
         path: '/ai/api/patient/health/v1/info/{fhirId}',
         port: 443,
         headers: {'Authorization': 'Basic Y29ydGFuYTpQQHNzdzByZDEwMQ=='},
         method: 'GET'
    },

    callPredictiveAnalysisOld: {
         host: 'cortana-ai-chatbot-api.azurewebsites.net',
         pathParams: [],
         path: '/ai/api/predictive/v1/nafld',
         port: 443,
         headers: {
             'Authorization': 'Basic Y29ydGFuYTpQQHNzdzByZDEwMQ==',
             'Content-type': 'application/json'
         },
         method: 'POST'
    },

    callPredictiveAnalysis: {
         host: 'cortana-ai-chatbot-api.azurewebsites.net',
         pathParams: ['fhirId'],
         path: '/ai/api/predictive/v1/nafld/{fhirId}',
         port: 443,
         headers: {'Authorization': 'Basic Y29ydGFuYTpQQHNzdzByZDEwMQ=='},
         method: 'GET'
    }
};


function httpReqQ(config, args) {

    return new Promise(function (resolve) {

        var req = _.clone(requestConfig[config]);

        // iterate over request params and replace them with the args
        _.forEach(req.pathParams, function (pathParam) {
            req.path = req.path.replace('{' + pathParam + '}', args.params[pathParam]);
        });

        var body = undefined;
        // a body, if one is provided
        if ( args.params && args.params.body) {
            body = JSON.stringify(args.params.body);
            console.log("Req. body: " + body);
        }

        var r = https.get(req, function (res) {
            var data = '';
            res.setEncoding('utf8');
            
            res.on('data', function(body) {
                data += body;
            });
            
            res.on('end', function() {
                resolve(data);
            });
        });

        // if ( body ) {
        //     r.write();
        //     r.end();
        // }
        
       });
}
        



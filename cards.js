var _ = require('lodash');

module.exports = {
    
    greetingCard: greetingCard,
    patientPropertiesCard: patientPropertiesCard,
    wantToLearnMoreCard: wantToLearnMoreCard,
    progressBarCard: progressBarCard,
    initiateHealthKitQueryCard: initiateHealthKitQueryCard,
    quiggles: quiggles
};

function quiggles(args) {

    var bodyBlocks = [];
    var block;
    if ( args.header ) {

        block = {
            "type": "TextBlock",
            "text": args.header,
            "size": "extraLarge",
            "weight": "bolder"
        };
        bodyBlocks.push(block);
    }

    if ( args.text ) {

        block = {
            "type": "TextBlock",
            "text": args.text,
            "size": "large"
        };
        bodyBlocks.push(block);
    }

    var quigglesImages = {
        'eyeClosed': '03-Quiggles-CS-tilt-eyeClosed.png',
        'blinking': '07-Quiggles-CoolWink4.gif'
    };
    var url = quigglesImages[args.img];
    url = 'https://teama1storage.blob.core.windows.net/scratchbot-85a/' + url;

    block = {
        'type': 'Image',
        'url': url,
        'size': 'large'
    };

    bodyBlocks.push(block);


    var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            'body': bodyBlocks
        }
    };
    return card;
}

    

function greetingCard(args) {

    var header = 'Hello there ' + args.firstName + '.';
    var text1 = 'Let me do a search in our data repository to build a medical profile that allows me to compare you to similar individuals.';
    var text2 = 'Is that OK with you?';


    var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'speak': text1,
            'version': '1.0',
            'body': [  
                
    {
      "type": "TextBlock",
      "size": "large",
      "text": text1,
      "wrap": true
    },
    {
      "type": "TextBlock",
      "size": "large",
      "text": text2,
      "wrap": true
    }
            ],
            'actions': [
                {
                    'type': 'Action.Submit',
                    'title': 'Sounds good. Continue.',
                    'speak': 'Sounds good. Continue.',
                    'data': {
                        'type': 'confirmedGreeting'
                    }
                }
            ]
        }
    };
    return card;

}

// function greetingCard(args) {

//     var card = {
//         'contentType': 'application/vnd.microsoft.card.adaptive',
//         'content': {
//             '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
//             'type': 'AdaptiveCard',
//             'speak': 'Of course I can speak. Hello ' + args.firstName + '! I am Quiggly and can help you find a health test package that fits your personal profile. Just let me know.',
//             'version': '1.0',
//             'body': [
//                 {
//                     'type': 'Container',
//                     'items': [
//                         {
//                             'type': 'ColumnSet',
//                             'columns': [
//                                 {
//                                     'type': 'Column',
//                                     'size': 'auto',
//                                     'items': [
//                                         {
//                                             'type': 'Image',
//                                             'url': 'https://teama1storage.blob.core.windows.net/scratchbot-85a/04-Quiggles-CS-talk.gif',
//                                             'size': 'medium',
//                                             'style': 'person'
//                                         }
//                                     ]
//                                 },
//                                 {
//                                     'type': 'Column',
//                                     'size': 'stretch',
//                                     'items': [
//                                         {
//                                             'type': 'TextBlock',
//                                             'text': 'Hello ' + args.firstName + ' !',
//                                             'size': 'large',
//                                             'weight': 'bolder',
//                                             'isSubtle': true
//                                         },
//                                         {
//                                             'type': 'TextBlock',
//                                             'size': 'large',
//                                             'text': 'I am Quiggly and can help you find a health test package that fits your personal profile. Just let me know.',
//                                             'wrap': true
//                                         }
//                                     ]
//                                 }
//                             ]
//                         }

//                     ]
//                 }
//             ],
//             'actions': [
//                 {
//                     'type': 'Action.Submit',
//                     'title': 'Yes. I want to learn more.',
//                     'speak': '<s>Yes. I want to learn more</s>',
//                     'data': {
//                         'type': 'wantToLearnMore'
//                     }
//                 }
//             ]
//         }
//     };
//     return card;

// }

function wantToLearnMoreCard(data) {

    var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            'body': [
                {
                    'type': 'TextBlock',
                    'text': 'Great',
                    'size': 'large'
                },
                {
                    'type': 'TextBlock',
                    'text': 'It gets better from here',
                    'weight': 'bolder'
                },
                {
                    'type': 'TextBlock',
                    'text': 'If you allow me to query the medical data associated with your account, I can match your profile data against our vast data repository ...',
                    'wrap': true
                }
            ],
            'actions': [
                {
                    'type': 'Action.Submit',
                    'title': 'I opt in. Go ahead',
                    'speak': '<s>I opt in. Go ahead</s>',
                    'data': {
                        'type': 'medicalDataSearch'
                    }
                }
            ]
        }
    };
    return card;
}

function initiateHealthKitQueryCard() {

    var textHealthKitData = 'I see that you have HealthKit enabled on your Apple device.' +
' If you grant me access I can import this data.'

    var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            'body': [
                {
                    'type': 'TextBlock',
                    'text': textHealthKitData,
                    'weight': 'bolder',
                    'size': 'medium',
                    'wrap': true
                }
            ],
            'actions': [
                {
                    'type': 'Action.Submit',
                    'title': 'Sure. Send me an authorization request',
                    'data': {
                        'type': 'initiateHealthKitQuery'
                    }
                }
            ]
        }
    };
    return card;
}

function patientPropertiesCard(data) {

    var keys = [
      {
          "type": "TextBlock",
          "text": "Bio Marker",
          "isSubtle": true,
          "weight": "bolder"
      }];

    var values = [
      {
          "type": "TextBlock",
          "text": "Value",
          "isSubtle": true,
          "weight": "bolder"
      }];

    var sources = [
      {
          "type": "TextBlock",
          "text": "Source",
          "isSubtle": true,
          "weight": "bolder"
      }];

    _.forOwn(data, function(value, key)  {
        var entry = {
            "type": "TextBlock",
            "text": "" + key,
            "spacing": "small"
        };
        keys.push(entry);

        entry = {
            "type": "TextBlock",
            "text": "" + value,
            "spacing": "small"
        };
        values.push(entry);

        entry = {
            "type": "TextBlock",
            "text": "Smart/FHIR",
            "spacing": "small"
        };
        sources.push(entry);
    });

    


var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.0",
  "body": [
      {
      "type": "TextBlock",
      "text": "I could retrieve the following data from our records.",
      "size": "medium",
      "weight": "bolder",
      "wrap": true
    },
    {
      "type": "ColumnSet",
      "separator": true,
      "spacing": "medium",
      "columns": [
        {
          "type": "Column",
          "width": "stretch",
          "items": keys
        },
        {
          "type": "Column",
          "width": "auto",
          "items": values
        },
        {
          "type": "Column",
          "width": "auto",
          "items": sources
        }
      ]
    }
  ]
}};

    return card;
}

function progressBarCard(args) {
   var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            
            'body': [
                {
      "type": "TextBlock",
      "text": args.msg,
      "size": "medium",
      "weight": "bolder",
      "wrap": true
    },
                {
                    'type': 'Image',
                    'url': 'https://teama1storage.blob.core.windows.net/scratchbot-85a/load2.gif'
                }
            ]
                       
        }
                           
   };
   return card;
}


var _ = require('lodash');

module.exports = {
    
    greetingCard: greetingCard,
    patientPropertiesCard: patientPropertiesCard,
    wantToLearnMoreCard: wantToLearnMoreCard,
    progressBarCard: progressBarCard
};

function greetingCard(args) {

    var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'speak': '<s>Hello ' + args.firstName + '!</s><s>I am Quiggly and can help you find you personalized health tests. Want to you want to do?</s>',
            'version': '1.0',
            'body': [
                {
                    'type': 'Container',
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
                                            'text': 'Hello ' + args.firstName + ' !',
                                            'size': 'large',
                                            'weight': 'bolder',
                                            'isSubtle': true
                                        },
                                        {
                                            'type': 'TextBlock',
                                            'size': 'large',
                                            'text': 'I am Quiggly and can help you find a health test package that fits your personal profile. Just let me know.',
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
                    'type': 'Action.Submit',
                    'title': 'Yes. I want to learn more.',
                    'speak': '<s>Yes. I want to learn more</s>',
                    'data': {
                        'type': 'wantToLearnMore'
                    }
                }
            ]
        }
    };
    return card;

}

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

function patientPropertiesCard(data) {

    var keys = [
      {
          "type": "TextBlock",
          "text": "Key",
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
  "speak": "patient data.",
  "body": [
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

function progressBarCard() {
   var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            
            'body': [
                {
                    'type': 'Image',
                    'url': 'https://teama1storage.blob.core.windows.net/scratchbot-85a/light_progress2.gif'
                }
            ]
                       
        }
                           
   };
   return card;
}


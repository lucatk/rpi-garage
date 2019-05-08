const config = require('./config.json')
const { garages } = config

const { findGarage, sendCode } = require('./helper.js')

const alexa = require('alexa-app')

// Define an alexa-app
var app = new alexa.app('alexa')
app.launch(function(req, res) {
    res.say('Welche Garage möchtest du öffnen?')
})

app.customSlot('garage', Object.keys(garages).map((key) => (
    {
        id: key,
        value: key,
        synonyms: garages[key].synonyms
    }
)))

app.intent('GarageIntent', {
    'slots': {
        'GARAGE': 'garage'
    },
    "utterances": [
        "{GARAGE} öffnen",
        "{GARAGE} schließen",
        "{GARAGE} auf",
        "{GARAGE} zu",
        "{GARAGE} stopp"
    ]
}, function(req, res) {
    const garageQuery = req.slot('GARAGE')
    const garage = findGarage(garageQuery)
    console.log(garageQuery)
    console.log(garage)
    if(garage) {
        sendCode(garage.code)
        res.say('Okay')
    } else {
        res.say('Ich kenne leider keine Garage mit diesem Namen')
    }
})

module.exports = app
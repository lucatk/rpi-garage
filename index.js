const {
    enableAlexa,
    port, password, sslCertificate, privateKey,
    transmitterPin, pulseLength,
    garages
} = require('./config.json')
const { findGarage } = require('./helper.js')

const express = require('express')
const https = require('https')
const AlexaApp = require('alexa-app').app
const rpi433 = require('rpi-433')
const rfEmitter = rpi433.emitter({
    pin: transmitterPin,
    pulseLength
})

const app = express()

app.post('/open/:id', (req, res) => {
    const id = req.params.id.toLowerCase()
    const { code } = garages[id]
    if(req.query['password'] === password) {
        if(code) {
            return rfEmitter.sendCode(code)
            .then((result) => {
                console.log("Opening #" + id + ": ", result)
                return res.status(200).end()
            }, (error) => {
                console.log("Error opening #" + id + ": ", error)
                return res.status(500).end()
            })
        }
    } else {
        return res.status(403).end()
    }
})

app.listen(port, () => console.log(`Listening on port ${port}!`))

if(enableAlexa) {
    const alexa = new AlexaApp('alexa')

    alexa.launch(function(req, res) {
        // res.say('Welche Garage möchtest du öffnen?')
        res.directive({
            type: 'Dialog.ElicitSlot',
            slotToElicit: 'GARAGE',
            updatedIntent: {
                name: 'GarageIntent',
                confirmationStatus: 'NONE'
            }
        })
    })
    alexa.customSlot('garage', Object.keys(garages).map((key) => (
        {
            id: key,
            value: key,
            synonyms: garages[key].synonyms
        }
    )))
    alexa.intent('GarageIntent', {
        'slots': {
            'GARAGE': 'garage'
        },
        "utterances": [
            "{GARAGE} öffnen",
            "{GARAGE} schließen",
            "{GARAGE} auf",
            "{GARAGE} zu",
            "{GARAGE} stopp",
            "{GARAGE}"
        ]
    }, function(req, res) {
        const garageQuery = req.slot('GARAGE')
        const garage = findGarage(garageQuery)
        console.log(garageQuery)
        console.log(garage)
        if(garage) {
            // rfEmitter.sendCode(garage.code)
            // .then((result) => {
            //     console.log("Opening #" + id + ": ", result)
            // }, (error) => {
            //     console.log("Error opening #" + id + ": ", error)
            // })
            res.say('Okay')
        } else {
            res.say('Ich kenne leider keine Garage mit diesem Namen')
        }
    })

    const alexaExpress = express()

    const morgan = require("morgan")
    alexaExpress.use(morgan('dev'))

    alexa.express({
        expressApp: alexaExpress,
        checkCert: false
    })

    const fs = require('fs')
    const key = fs.readFileSync('./' + privateKey)
    const cert = fs.readFileSync('./' + sslCertificate)

    const server = https.createServer({
        key: key,
        cert: cert
    }, alexaExpress)
    server.listen(443, () => console.log(`[Alexa] Listening on port 443!`))
}
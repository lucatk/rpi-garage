const config = require('./config.json')

const express = require('express')
const rpi433 = require('rpi-433')

const {
    port, password,
    transmitterPin, pulseLength,
    codes
} = config

const app = express()
const rfEmitter = rpi433.emitter({
    pin: transmitterPin,
    pulseLength
})

app.post('/open/:id', (req, res) => {
    const id = req.params.id.toLowerCase()
    const code = codes[id]
    if(req.query['password'] === password) {
        if(code) {
            return rfEmitter.sendCode(code)
            .then((result) => {
                console.log("Opening #" + id + ": ", result)
                return res.send(200).end()
            }, (error) => {
                console.log("Error opening #" + id + ": ", error)
                return res.send(500).end()
            })
        }
    } else {
        return res.status(403).end()
    }
})

app.listen(port, () => console.log(`Listening on port ${port}!`))
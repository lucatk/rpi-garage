const config = require('./config.json')
const { sendCode, findGarage } = require('./helper.js')

const express = require('express')

const {
    port, password,
    garages
} = config

const app = express()

if(config.enableAlexa) {
    const alexa = require('./alexa.js')
    alexa.express({
        expressApp: app
    })
}

app.post('/open/:id', (req, res) => {
    const id = req.params.id.toLowerCase()
    const { code } = garages[id]
    if(req.query['password'] === password) {
        if(code) {
            return sendCode(code)
            .then(() => res.status(200).end())
            .catch(() => res.status(500).end())
        }
    } else {
        return res.status(403).end()
    }
})

app.listen(port, () => console.log(`Listening on port ${port}!`))
if (!Object.entries) {
    Object.entries = function( obj ){
        var ownProps = Object.keys( obj ),
            i = ownProps.length,
            resArray = new Array(i) // preallocate the Array
        while (i--)
        resArray[i] = [ownProps[i], obj[ownProps[i]]]
        
        return resArray
    }
}

const config = require('./config.json')
const { garages, transmitterPin, pulseLength } = config

const rpi433 = require('rpi-433')
const rfEmitter = rpi433.emitter({
    pin: transmitterPin,
    pulseLength
})

module.exports = {
    findGarage: (query) => {
        const result = Object.entries(garages).find(entry => {
            return entry[0] == query || entry[1].synonyms.find((syn) => syn == query)
        })
        if(result) {
            return result[1]
        }
    },
    sendCode: (code) => {
        return new Promise((resolve, reject) => {
            rfEmitter.sendCode(code)
            .then((result) => {
                console.log("Opening #" + id + ": ", result)
                resolve()
            }, (error) => {
                console.log("Error opening #" + id + ": ", error)
                reject()
            })
        })
    }
}
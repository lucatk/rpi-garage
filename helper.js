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
const { garages } = config

module.exports = {
    findGarage: (query) => {
        const result = Object.entries(garages).find(entry => {
            return entry[0] == query || entry[1].synonyms.find((syn) => syn == query)
        })
        if(result) {
            return result[1]
        }
    }
}
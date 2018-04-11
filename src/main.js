// Required Stuff
const express = require('express')
const app = express()

app.use(express.static('public'))

const http = require('http').Server(app)
global.io = require('socket.io')(http)
global.config = require('./config.json')
global.language = require('./language/' + config.settings.language + '.json')
const apikey = require('./apikey.json')

const streamlabsSocketClient = require('streamlabs-socket-client')
global.client = new streamlabsSocketClient({
    'token': apikey.key,
    'emitTests': config.settings.showTests
})

const types = {}

// Start the server
http.listen(config.settings.port, function() {
    console.log('[SERVER] Listening on *:' + config.settings.port)
})

// Start streamlabsSocketClient
client.connect()

// Make the events work
client.client.on('event', e => {
    // Log the event data for testing
    console.log(JSON.stringify(e, 0, 4))

    // Check if there even is a message
    if (e.message) {
        // Check if the message is an array and change it to the first object
        if (Array.isArray(e.message)) {
            e.message = e.message[0]
        }

        // Validate the message
        e.message.validated = true

        // Random names for testing
        if (config.settings.randomNamesOnTests && e.message.isTest) {
            e.message.name = config.names[Math.floor(Math.random() * config.names.length)]
        }

        // Random Months for testing subscriptions
        if (config.settings.randomMonthsOnTests && e.message.isTest && e.type == 'subscription') {
            e.message.months = Math.floor(Math.random() * 12) + 1
        }

        // Emit the event to the client
        client.emit('.' + e.type, e.message)
    }
})

// Setting up the alerts
config.types.forEach((type) => {
    types[type] = require('./types/' + type + '.js')
    types[type].initiate(io, client)
})

// Setting up the overlay
io.on('connection', (socket) => {
    console.log('[SERVER] New Connection! (' + socket.request.connection.remoteAddress + ')')

    // Send necessery data to the overlay and wait for a response
    socket.emit('setup', {'config': config, 'language': language})
})
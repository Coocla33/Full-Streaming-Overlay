let debug = false

// Express stuff
const express = require('express')
const app = express()

app.use(express.static('public'))

const http = require('http').Server(app)
const io = require('socket.io')(http)
const config = require('./config.json')

// Needed modules
const StreamlabsSocketClient = require('streamlabs-socket-client')
const Spotilocal = require('spotilocal')

const client = new StreamlabsSocketClient({
    'token': config.token,
    'emitTests': true
})

let names = [
    'Coocla33',
    'ThisIsAReallyLongName',
    'xXx_Pussy_xXx',
    'test123',
    'fuckmesideways',
    'fckmsdws'
]

client.connect()
client.client.on('event', e => {
    if (Array.isArray(e.message)) {
        if (e.message[0].isTest) {
            e.message[0].name = names[Math.floor(Math.random() * names.length)]
        }
        e.message[0].valid = true
        client.emit(e.type, e.message[0])
    } else {
        client.emit(e.type, e.message)
    }
})

// Stuff
let containers = {
    'topDonation': {
        'name': '',
        'amount': 0,
        'formatted_amount': ''
    },
    'latestDonation': {
        'name': '',
        'amount': 0,
        'formatted_amount': ''
    },
    'latestFollower': {
        'name': '',
        'count': 0
    },
    'currentSong': {
        'song': '',
        'artist': ''
    }
}

// Stuff to do when debugging
if (debug) {
    console.log('[DEBUG - INFO] Debugging mode enabled!')
}

// Listen the servero n port 3000
http.listen(3000, function() {
    console.log('[SERVER - INFO] Listening on localhost:3000')
})

// Do stuff when someone connects.
io.on('connection', function(socket) {

    // On connection
    if (debug) {
        console.log('[DEBUG - SERVER] Socket connected!')
    }

    // Update everything
    // topDonation
    if (containers.topDonation.name != '') {
        // When there is a top donation
        socket.emit('update', {
            'type': 'topDonation',
            'user': containers.topDonation.name,
            'amount': containers.topDonation.formatted_amount
        })
    } else {
        // When there is no top donation
        socket.emit('update', {
            'type': 'topDonation',
            'user': 'No Donations',
            'amount': 0
        })
    }

    // latestDonation
    if (containers.latestDonation.name != '') {
        // When there is a latest donation
        socket.emit('update', {
            'type': 'latestDonation',
            'user': containers.latestDonation.name,
            'amount': containers.latestDonation.formatted_amount
        })
    } else {
        // When there is no latest donation
        socket.emit('update', {
            'type': 'latestDonation',
            'user': 'No Donations',
            'amount': 0
        })
    }

    // latestFollower
    if (containers.latestFollower.name != '') {
        // When there is a latest follower
        socket.emit('update', {
            'type': 'latestFollower',
            'user': containers.latestFollower.name,
            'count': containers.latestFollower.count
        })
    } else {
        // When there is no latest follower
        socket.emit('update', {
            'type': 'latestFollower',
            'user': 'No Followers',
            'count': 0
        })
    }

    // currentSong
    if (containers.currentSong.song != '') {
        // When there is a song playing
        socket.emit('update', {
            'type': 'currentSong',
            'song': containers.currentSong.song,
            'artist': containers.currentSong.artist
        })
    } else {
        // When there isn't a song playing
        socket.emit('update', {
            'type': 'currentSong',
            'song': '',
            'artist': ''
        })
    }

    // On disconnect
    socket.on('disconnect', function() {
        if (debug) {
            console.log('[DEBUG - SERVER] Socket disconnected!')
        }
    })
})

// Updates
// Latest/Top Donation
client.on('donation', (data) => {
    if (data.valid) {
        // Send follow data when debug enabled
        if (debug) {
            console.log(JSON.stringify(data, 0, 4))
        }

        // Warn about debug disabled
        if (data.isTest && !debug) {
            console.log('[SERVER - INFO] DEBUGGING DISABLED. Ignoring test alert (follow)')
        } else {
            // Calculate top donation
            if (data.amount > containers.topDonation.amount) {
                // top Donation
                containers.topDonation.name = data.name
                containers.topDonation.amount = data.amount
                containers.topDonation.formatted_amount = data.formatted_amount

                // Update all active overlays
                io.emit('update', {
                    'type': 'topDonation',
                    'user': data.name,
                    'amount': data.formatted_amount
                })
            }

            // latest Donation
            containers.latestDonation.name = data.name
            containers.latestDonation.amount = data.amount
            containers.latestDonation.formatted_amount = data.formatted_amount

            // Update all active overlays
            io.emit('update', {
                'type': 'latestDonation',
                'user': data.name,
                'amount': data.formatted_amount
            })
        }
    }
})

// Latest Follower
client.on('follow', (data) => {
    console.log(data)
    if (data.valid) {
        // Send follow data when debug enabled
        if (debug) {
            console.log(JSON.stringify(data, 0, 4))
        }

        // Warn about debug disabled
        if (data.isTest && !debug) {
            console.log('[SERVER - INFO] DEBUGGING DISABLED. Ignoring test alert (follow)')
        } else {
            // Setup containers variable
            containers.latestFollower.name = data.name
            containers.latestFollower.count++

            // Update all active overlays
            io.emit('update', {
                'type': 'latestFollower',
                'user': data.name,
                'count': containers.latestFollower.count
            })
        }
    }
})

// Spotify
const spotilocal = new Spotilocal.Spotilocal()
spotilocal.init().then((spotify) => {
    setInterval(function() {
        checksong(spotify, function(data) {
            io.emit('update', {
                'type': 'currentSong',
                'song': data.song,
                'artist': data.artist
            })
        })
    }, 200)
}).catch((err) => {
    if (debug) {
        console.log('[DEBUG - INFO] Couldn\'t find a running version of spotify on this machine!')
    }

    io.emit('update', {
        'type': 'currentSong',
        'song': '',
        'artist': ''
    })
})

// Checks Spotify Song
function checksong(spotify, callback) {
    let data = {
        'song': '',
        'artist': ''
    }
    spotify.getStatus().then((status) => {

        if (status.playing) {
            if (containers.currentSong.song != status.track.track_resource.name) {
                data.song = status.track.track_resource.name
                data.artist = status.track.artist_resource.name
                containers.currentSong.song = status.track.track_resource.name
                containers.currentSong.artist = status.track.artist_resource.name
                callback(data)
            }
        } else {
            if (containers.currentSong.song != '') {
                containers.currentSong.song = ''
                containers.currentSong.artist = ''
                callback(data)
            }
        }
    }).catch((err) => {
        callback()
    })
}
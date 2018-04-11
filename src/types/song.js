// Static Objects
let latest = {
    'type': 'song',
    'msg': ''
}

let song

const Spotilocal = require('spotilocal')
const spotilocal = new Spotilocal.Spotilocal()

// Initiate the song alerts
exports.initiate = function(io, client) {

    spotilocal.init().then((spotify) => {
        setInterval(function() {
            
            spotify.getStatus().then((status) => {
                if (status.playing && status.track.track_type != 'ad') {
                    if (song != status.track.track_resource.name) {
                        song = status.track.track_resource.name

                        if (config.settings.showSongArtist) {
                            latest.msg = song + '<span class="special seetrough"> - ' + status.track.artist_resource.name + '</span>'
                        } else {
                            latest.msg = song
                        }

                        io.emit('update', latest)
                    }

                } else {
                    if (latest.msg != '') {
                        latest.msg = ''
                        song = ''

                        io.emit('update', latest)
                    }
                }
            }).catch((err) => {
                throw err
            })
        }, config.settings.songCheckingSpeed)
    }).catch((err) => {
        throw err
    })
}

exports.update = function(io) {
    io.emit('update', latest)
}
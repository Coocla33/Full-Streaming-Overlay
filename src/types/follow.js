// Static Objects
let latest = {
    'type': 'follow',
    'msg': ''
}

// Initiate the follower alerts
exports.initiate = function(io, client) {
    client.on('.follow', (data) => {
        // Check if tests are allowed
        if (data.isTest && !config.settings.showTests) {
            return
        }

        latest.msg = data.name

        io.emit('update', latest)
    })
}

exports.update = function(io) {
    io.emit('update', latest)
}
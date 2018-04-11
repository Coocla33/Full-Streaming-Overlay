// Static objects
let latest = {
    'type': 'host',
    'msg': ''
}

// Initiate the host alerts
exports.initiate = function(io, client) {
    client.on('.host', (data) => {
        // Check if tests are allowed
        if (data.isTest && !config.settings.showTests) {
            return
        }

        if (config.settings.showHostAmount) {
            latest.msg = data.name + '<span class="special seetrough"> - ' + data.viewers + (data.viewers == 1 ? (" " + language.types.viewer) : (" " + language.types.viewers)) + '</span>'
        } else {
            latest.msg = data.name
        }

        io.emit('update', latest)
    })
}

exports.update = function (io) {
    io.emit('update', latest)
}
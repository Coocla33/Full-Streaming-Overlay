// Static Objects
let latest = {
    'type': 'sub',
    'msg': ''
}


exports.initiate = function(io, client) {
    client.on('.subscription', (data) => {
        // Check if tests are allowed
        if (data.isTest && !config.settings.showTests) {
            return
        }
        
        if (config.settings.showSubMonths) {
            latest.msg = data.name + '<span class="special seetrough"> - ' + data.months + (data.months == 1 ? (" " + language.types.month) : (" " + language.types.months)) + '</span>'
        } else {
            latest.msg = data.name
        }

        io.emit('update', latest)
    })
}

exports.update = function(io) {
    io.emit('update', latest)
}
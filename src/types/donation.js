// Static Objects
let latestDonation = {
    'type': 'donation',
    'msg': ''
}

let topDonation = {
    'type': 'topDonation',
    'msg': ''
}

let topAmount = 0

// Initiate the donation alerts
exports.initiate = function(io, client) {
    client.on('.donation', (data) => {
        // Check if tests are allowed
        if (data.isTest && !config.settings.showTests) {
            return
        }

        if (config.settings.showDonationAmount) {
            latestDonation.msg = data.name + '<span class="special seetrough"> - </span><span class="special green">' + data.formatted_amount + '</span>'
        } else {
            latestDonation.msg = data.name
        }

        // Top Donation Calculations
        if (config.settings.enableTopDonation) {
            
            // New top donation
            if (data.amount > topAmount) {

                topAmount = data.amount
                
                if (config.settings.showDonationAmount) {
                    topDonation.msg = data.name + '<span class="special seetrough"> - </span><span class="special green">' + data.formatted_amount + '</span>'
                } else {
                    topDonation.msg = data.name
                }
                
                io.emit('update', topDonation)
            }
        }

        io.emit('update', latestDonation)
    })

    if (config.settings.enableBitDonation) {
        client.on('.bits', (data) => {
            // Check if tests are allowed
            if (data.isTest && !config.settings.showTests) {
                return
            }

            if (config.settings.showDonationAmount) {
                latestDonation.msg = data.name + '<span class="special seetrough"> - </span><span class="special green">' + data.amount + (data.amount == 1 ? (' ' + language.types.bit) : (' ' + language.types.bits)) + '</span>'
            } else {
                latestDonation.msg = data.name
            }

            io.emit('update', latestDonation)
        })
    }
}

exports.update = function (io) {
    io.emit('update', (latestDonation, topDonation))
}
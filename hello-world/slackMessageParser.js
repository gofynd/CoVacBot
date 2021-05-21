const dateUtil = require('./dateUtil')
const constants = require('./constant')

var vaccineTypes = ['covaxin', 'covishield']
var blocksByVaccine = []
var _45f1, _45f2, _45p1, _45p2, _18p1, _18p2, _18f1, _18f2

function getSlackMessage(availibilityData, district, districtName) {
    var parsedDate = (new Date(dateUtil.invert(availibilityData.currentDate, "-"))).toDateString();

    for(var vac of vaccineTypes) {
        _45f1 = availibilityData[district]['free'][vac]['_45']['dose1']
        _45f1 = (_45f1 === undefined) ? 0 : _45f1
        
        _45f2 = availibilityData[district]['free'][vac]['_45']['dose2']
        _45f2 = (_45f2 === undefined) ? 0 : _45f2

        _45p1 = availibilityData[district]['paid'][vac]['_45']['dose1']
        _45p1 = (_45p1 === undefined) ? 0 : _45p1

        _45p2 = availibilityData[district]['paid'][vac]['_45']['dose2']
        _45p2 = (_45p2 === undefined) ? 0 : _45p2
    
        _18f1 = availibilityData[district]['free'][vac]['_18']['dose1']
        _18f1 = (_18f1 === undefined) ? 0 : _18f1

        _18f2 = availibilityData[district]['free'][vac]['_18']['dose2']
        _18f2 = (_18f2 === undefined) ? 0 : _18f2

        _18p1 = availibilityData[district]['paid'][vac]['_18']['dose1']
        _18p1 = (_18p1 === undefined) ? 0 : _18p1

        _18p2 = availibilityData[district]['paid'][vac]['_18']['dose2']
        _18p2 = (_18p2 === undefined) ? 0 : _18p2
    
        var totalQuantity = _45f1+_45f2+_45p1+_45p2+_18f1+_18f2+_18p1+_18p2
        
        //If there is no quantity of the vaccine, skip the message for that type of vaccine
        if(totalQuantity == 0 ) {
            continue
        }

        blocksByVaccine.push(
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `\n\n:syringe: *${vac.toUpperCase()}*`
                }
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": `*Age 18+: Dose 1*\n<${constants.URL.COWIN_HOME}|Free: ${_18f1} | Paid: ${_18p1}>`
                    },
                    {
                        "type": "mrkdwn",
                        "text": `*Age 18+: Dose 2*\n<${constants.URL.COWIN_HOME}|Free: ${_18f2} | Paid: ${_18p2}>`
                    }
                ]
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": `*Age 45+: Dose 1*\n<${constants.URL.COWIN_HOME}|Free: ${_45f1} | Paid: ${_45p1}>`
                    },
                    {
                        "type": "mrkdwn",
                        "text": `*Age 45+: Dose 2*\n${constants.URL.COWIN_HOME}|Free: ${_45f2} | Paid: ${_45p2}>`
                    }
                ]
            },
        )
    }

    var blockMessage = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": `\nDistrict: ${districtName} - ${district}`,
                "emoji": true
            }
        },
        {
            "type": "divider"
        },
        blocksByVaccine,
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": `\n:hourglass_flowing_sand: *When:*\n From ${parsedDate} to next 7 days`
                }
            ]
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": `*Details:*\n${constants.TEXT.SLK_VACCINE_MSG}`
                }
            ]
        }
    ]

    blockMessage = blockMessage.flat()
    return blockMessage
}

module.exports = {
    getSlackMessage: getSlackMessage 
}
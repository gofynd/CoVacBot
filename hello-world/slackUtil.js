const axios = require('axios')
const dateUtil = require('./dateUtil')
const constants = require('./constant');
const _ = require('lodash')
const { isEqual } = require('lodash')
const slackMsgParser = require('./slackMessageParser')

async function notifyUser(user,
    availibilityData, 
    district, 
    districtName,
    timeDiff,
    startHour, 
    stopHour,
    currentHour) {

    
    /* 
        Check if notification on for a user
        Pause notification for specific night hours 
        If slack id not there, stop the notifications
        Send notfication only for specific perios for a user
    */
    if (
        !user.alert 
        || !(user.alert.toLowerCase() == "true")
        || (currentHour < startHour && currentHour > stopHour)
        || !user.slack
        || dateUtil.diffInHours(Date.now(), user.last_sent) < timeDiff) {
        return
    }

    if (user.history == undefined) {
        user.history = '{}'
    }

    var blockMessage = await slackMsgParser.getSlackMessage(availibilityData, district, districtName)

    if (!(_, isEqual(blockMessage, JSON.parse(user.history)))) {

        const res = await axios.post(constants.URL.SLACK_POST, {
            channel: Buffer.from(user.slack, 'base64').toString(),
            blocks: blockMessage,
            username: 'VaccineScanner',
            icon_emoji: ':hospital:'
        }, { headers: { authorization: `Bearer ${constants.CREDS.SLACK_TOKEN}` } });

        user.last_sent = Date.now()
        user.history = JSON.stringify(blockMessage)
        await user.save()
    }
}

async function getSlackUsers() {
    var userData = []
    var cursor
    var params = {
        limit: 20
    }

    while (true) {

        if (cursor) {
            params['cursor'] = cursor
        }

        const userResponse = await axios.get(constants.URL.SLACK_USERS, {
            headers: {
                authorization: `Bearer ${constants.CREDS.SLACK_TOKEN}`,
            },
            params: params,
        });

        if (userResponse.data.ok
            && userResponse.status == 200
            && userResponse.data.response_metadata.next_cursor) {
            cursor = userResponse.data.response_metadata.next_cursor
        } else {
            break
        }

        for (var user of userResponse.data.members) {
            if (user.deleted || !user.profile.email) {
                continue
            }
            userData.push({
                'name': user.profile.real_name,
                "email": user.profile.email,
                'slack': Buffer.from(user.id).toString('base64'),
                'alert': true,
                'last_sent': 0,
                'history': '{}',
            })

        }
    }

    return userData
}

module.exports = {
    notifyUser: notifyUser,
    getSlackUsers: getSlackUsers,
}

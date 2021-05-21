var district, currentDate
module.exports = {
    URL: Object.freeze({
        SLACK_POST: 'https://slack.com/api/chat.postMessage',
        SLACK_USERS: 'https://slack.com/api/users.list',
        COWIN_DIST_VAC: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${0}&date=${1}`,
        COWIN_DIST_LIST: 'https://cdn-api.co-vin.in/api/v2/admin/location/districts/',
        COWIN_STATE_LIST: 'https://cdn-api.co-vin.in/api/v2/admin/location/states',
        COWIN_HOME: '<https://www.cowin.gov.in/home'
    }),
    
    TEXT: Object.freeze({
        SLK_VACCINE_MSG: "\nNeed help? Aske the DRI",
        SLK_DESCRIPTION_MSG: "This bot updates you about covid vaccine slots from \
    Cowin portal, data is cached for 30 mins on Cowin portal so availability might be stale.",
        USERAGENT: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
    }),
    
    CREDS: Object.freeze({
        SHEET_ID: '',
        SLACK_TOKEN: '',
    }),
    
    HEADERS: Object.freeze({
        DISTRICT: ['state_district', 'state_name', 'district_name', 'state_id', 'district_id'],
        USER: ['name', 'email', 'slack', 'district', 'alert', 'last_sent', 'history'],
    })
}
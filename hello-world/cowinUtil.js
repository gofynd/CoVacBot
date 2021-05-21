const axios = require('axios')
const constants = require('./constant')
const sheetUtil = require('./sheetUtil')
var dateUtil = require('./dateUtil')

var userAgent = constants.USERAGENT

async function refreshStateDistrictMap() {
    
    var stateDistrictList = []
    const res = await axios.get(constants.URL.COWIN_STATE_LIST, {
        headers: {
            'User-Agent': userAgent,
        }
    });

    var stateList = res.data.states
    if (stateList) {
        for (var state of stateList) {
            const districtRes = await axios.get(constants.URL.COWIN_DIST_VAC + state.state_id, {
                headers: {
                    'User-Agent': userAgent,
                }
            });

            for(var district of districtRes.data.districts) {
                stateDistrictList.push({
                    'state_district': state.state_name+'_'+district.district_name,
                    'state_name': state.state_name, 
                    'district_name': district.district_name,
                    'state_id': state.state_id, 
                    'district_id': district.district_id,
                 })
            }
        }
    }

    return stateDistrictList
}

async function getDistrictVaccineData(district, currentDate) {
    var avail = false
    const res = await axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district}&date=${currentDate}`, {
        headers: {
            'User-Agent': constants.TEXT.USERAGENT,
        }
    });

    if (res.status == 403) {
        await sheetUtil.updateLastRow(i)
    }

    var centers = res.data.centers
    var availData = await getCenterVaccineObject(currentDate)
    
    for (var center of centers) {
        
        var sessions = center.sessions
        var feeType = center.fee_type.toLowerCase()

        for (var session of sessions) {
            var vaccineName = session.vaccine.toLowerCase()
            
            if (session.available_capacity_dose1 > 0) {
                avail = true
                availData[feeType][vaccineName]['_' + session.min_age_limit]['dose1'] += session.available_capacity_dose1

                if (dateUtil.compareDates(availData[feeType][vaccineName]['_' + session.min_age_limit]['d1date'], session.date)) {
                    availData[feeType][vaccineName]['_' + session.min_age_limit]['d1date'] = session.date
                }
            }

            if (session.available_capacity_dose2 > 0) {
                avail = true
                availData[feeType][vaccineName]['_' + session.min_age_limit]['dose2'] += session.available_capacity_dose2

                if (dateUtil.compareDates(availData[feeType][vaccineName]['_' + session.min_age_limit]['d2date'], session.date)) {
                    availData[feeType][vaccineName]['_' + session.min_age_limit]['d2date'] = session.date
                }
            }
        }
    }

    if (avail) {
        return availData
    } else {
        return {}
    }
}

async function getCenterVaccineObject(currentDate) {
    var doseInfo = {
        'dose1': 0,
        'dose2': 0,
        'd1date': currentDate,
        'd2date': currentDate,
    }

    var ageDoseInfo = {
        '_45': JSON.parse(JSON.stringify(doseInfo)),
        '_18': JSON.parse(JSON.stringify(doseInfo))
    }

    var vaccineInfo = {
        'covaxin': JSON.parse(JSON.stringify(ageDoseInfo)),
        'covishield': JSON.parse(JSON.stringify(ageDoseInfo)),
    }

    var availData = {
        'free': JSON.parse(JSON.stringify(vaccineInfo)),
        'paid': JSON.parse(JSON.stringify(vaccineInfo))
    }

    return availData
}

module.exports = {
    refreshStateDistrictMap: refreshStateDistrictMap,
    getDistrictVaccineData: getDistrictVaccineData
}
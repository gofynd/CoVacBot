
// const url = 'http://checkip.amazonaws.com/';
let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

exports.lambdaHandler = async (event, context) => {

    var sheetUtil = require('./sheetUtil')
    var slackUtil = require('./slackUtil')
    var dateutil = require('./dateUtil')
    var cowinUtil = require('./cowinUtil')
    var _ = require('lodash')

    //Sheet initializations
    await sheetUtil.init()
    var users = await sheetUtil.getUsers()
    var totalUsers = users.length
    var lastRow = await sheetUtil.getLastRow()
    var timeDiff = await sheetUtil.getScheduleDiff()
    var startHour = await sheetUtil.getStartHour()
    var stopHour = await sheetUtil.getStopHour()
    var currentUserIndex = lastRow

    var currentDate = dateutil.getToday()
    var currentHour = new Date().getHours()

    try {
        var availibilityData = {}
        availibilityData['currentDate'] = currentDate

        for (var i = lastRow; i < totalUsers; i++) {

            if (i == totalUsers - 1) {
                await sheetUtil.updateLastRow(0)
            }

            currentUserIndex = i
            var districtName = users[i].district || ''
            if (!districtName) {
                continue
            }

            var districtObject = sheetUtil.getStateDistrcitMap()[districtName]
            if (!districtObject) {
                continue
            }
            var district = parseInt(districtObject['district_id'])

            var districtData = availibilityData[district]
                || await cowinUtil.getDistrictVaccineData(district, currentDate);

            if (!_.isEmpty(districtData)) {
                availibilityData[district] = districtData
            }

            if (district in availibilityData) {
                await slackUtil.notifyUser(
                    users[i], 
                    availibilityData, 
                    district, 
                    districtName,
                    timeDiff,
                    startHour, 
                    stopHour,
                    currentHour
                    )
            }

            await sheetUtil.updateLastRow(currentUserIndex)
        }

        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'Updated',
            })
        }
    } catch (err) {
        console.log(err);
        await sheetUtil.updateLastRow(currentUserIndex)
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: err,
            })
        }
    }
    return response
};

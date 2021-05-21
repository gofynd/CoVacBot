const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./sheets_service_account.json');
const slackUtil = require('./slackUtil')
const cowinUtil = require('./cowinUtil')
const constants = require('./constant');
const  _ = require('lodash');

var doc
var userInfoSheet, appStateSheet, stateDistrictSheet
var stateDistrictMap = {}
var LastRow, AlertHourDiff, StartHour

async function init(){
    doc = new GoogleSpreadsheet(constants.CREDS.SHEET_ID); //Prod sheet
    // doc = new GoogleSpreadsheet('');  //test sheet
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo(); // loads document properties and worksheets

    userInfoSheet = doc.sheetsByIndex[0]; 
    appStateSheet = doc.sheetsByIndex[1];
    stateDistrictSheet = doc.sheetsByIndex[2];
    
    var appStateData = await appStateSheet.getRows()
    var doInit = appStateData[0].Init
    LastRow = parseInt(appStateData[0].LastRow)
    AlertHourDiff = parseInt(appStateData[0].AlertHourDiff)
    StartHour = parseInt(appStateData[0].StartHour) //Make sure to put data in UTC hour in sheet
    StopHour = parseInt(appStateData[0].StopHour)  //Make sure to put data in UTC hour in sheet

    //Keeping district data locally cached while the lambda runs
    var refreshStateMap = appStateData[0].RefreshStateMap
    var appStateRows = await stateDistrictSheet.getRows()
    if(appStateRows.length > 0) {
        for(var state of appStateRows) {
            stateDistrictMap[state.state_district] = state
        }
    }

    // Refreshes district data in a seperate sheet for better visualization of data
    if(refreshStateMap.toLowerCase() == 'true') {
        stateDistrictMap = await cowinUtil.refreshStateDistrictMap()
        await stateDistrictSheet.clear()
        await stateDistrictSheet.setHeaderRow(constants.HEADERS.DISTRICT)
        await stateDistrictSheet.addRows(stateDistrictMap)
    }

    // Get all users from slack and put them in sheet 1
    if (doInit.toLowerCase() == "true") {
        var usersData = await slackUtil.getSlackUsers()
        await userInfoSheet.clear()
        await userInfoSheet.setHeaderRow(constants.HEADERS.USER)
        await userInfoSheet.addRows(usersData)
    }

    appStateData[0].Init = false
    appStateData[0].RefreshStateMap = false
    await appStateData[0].save()
}

async function getUserSheet() {
    return userInfoSheet
}

async function getStateSheet() {
    return appStateSheet
}

async function getUsers() {
    return await userInfoSheet.getRows()
}

async function getLastRow() {
    return LastRow
}

async function updateLastRow(value) {
    var stateData = await appStateSheet.getRows()
    stateData[0].LastRow = value
    await stateData[0].save()
}

async function getScheduleDiff() {
    return AlertHourDiff
}

function getStateDistrcitMap() {
    return stateDistrictMap
}

async function getStartHour() {
    return StartHour
}

async function getStopHour() {
    return StopHour
}
// Initialize the sheet - doc ID is the long id in the sheets URL


module.exports = {
    getUserSheet: getUserSheet,
    getStateSheet: getStateSheet,
    init: init,
    getLastRow: getLastRow,
    getUsers: getUsers,
    updateLastRow: updateLastRow,
    getScheduleDiff: getScheduleDiff,
    getStateDistrcitMap: getStateDistrcitMap,
    getStartHour: getStartHour,
    getStopHour: getStopHour
}
function invert(date, join_symbol) {
    return date.split(/[/-]/).reverse().join(join_symbol)
}
function compareDates(date1, date2) {
    return invert(date1,"").localeCompare(invert(date2, ""));
}

function diffInHours(d1, d2) {
    var hours = Math.abs(d1 - d2) / 36e5;
    return hours
}

function getToday() {
    var today = new Date();
    var dd = today.getDate();

    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }
    today = dd + '-' + mm + '-' + yyyy;
    return today;
}


module.exports = {
    compareDates: compareDates,
    diffInHours: diffInHours,
    invert: invert,
    getToday: getToday,
}
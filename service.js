const textCapitalize = (text) => {
    // .split(/[ .]/)
    var sentence = text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    sentence = sentence.split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('.')
    return sentence
}

const formatDate = (dateString) => {
    if (!dateString) return undefined;
    let date = dateString.split('-').join('/')
    const [month, day, year] = date.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day)
    inputDate.setUTCHours(0, 0, 0, 0);
    return inputDate
}

const getMonthAndYear = (date) => {
    const month = date.getMonth()
    const year = date.getFullYear()
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    return months[month] + year
}

const findNumberOfDays = (fromDate, toDate) => {
    const differenceInMs = toDate - fromDate;
    const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);    // Convert milliseconds to days
    const days = Math.round(differenceInDays) + 1
    return days
}


const getDatesBetween = (startDate, endDate) => {
    let datesArray = [];
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
        currentDate.setDate(currentDate.getDate() + 1);
        datesArray.push(new Date(currentDate));
        if (datesArray.length > 30) break;
    }

    return datesArray;
}

const isHoliday = (holidays, date) => {
    let holiday = holidays.find((item) => new Date(item.date).getTime() === new Date(date).getTime())?.holiday
    if (!holiday) {
        holiday = new Date(date).getDay() === 0 ? "Sunday" : null
    }

    return holiday
}

const isContinuousWorkingDates = (date1, date2, holidays) => {

    const betweenDates = getDatesBetween(date1, date2)
    let breakDay = null

    for (const date of betweenDates) {
        let holiday = isHoliday(holidays, date)

        if (!holiday) {
            breakDay = date
            break;
        }
    }

    if (breakDay) return false

    return true
}

const removeInitialFromName = (name) => {
    const initialRemovedNameArray = name.split(' ').filter(string => string.length > 1)
    const newName = initialRemovedNameArray.join(' ')
    return newName
}

const calculateLevenshteinDistance = (a, b) => {
    const dp = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) {
        dp[i][0] = i;
    }

    for (let j = 0; j <= b.length; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1, // deletion
                dp[i][j - 1] + 1, // insertion
                dp[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return dp[a.length][b.length];
}

const isNameSimilar = (nameOne, nameTwo) => {
    let name1 = nameOne.trim().toLowerCase()
    let name2 = nameTwo.trim().toLowerCase()

    name1 = removeInitialFromName(name1)
    name2 = removeInitialFromName(name2)

    const distance = calculateLevenshteinDistance(name1, name2);
    return distance <= 3 // threshold
}

module.exports = {
    textCapitalize, formatDate, getMonthAndYear, findNumberOfDays, getDatesBetween,
    isHoliday, isContinuousWorkingDates, isNameSimilar
}
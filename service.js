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

const isIntialChanged = (nameOne, nameTwo) => {
    let name1 = nameOne
    let name2 = nameTwo
    const nameOneArray = nameOne.split(' ')
    const nameTwoArray = nameTwo.split(' ')

    if (nameOneArray[0].length === 1 && (nameOneArray[0] === nameTwoArray[nameTwoArray.length - 1])) { // if initial in front of the first array and last of the 2nd array same
        nameOneArray.shift()
        name1 = nameOneArray.join(' ')

        nameTwoArray.pop()
        name2 = nameTwoArray.join(' ')

        return { initialDeletedNameOne: name1, initialDeletedNameTwo: name2 }
    } else if (nameOneArray[nameOneArray.length - 1].length === 1 && (nameOneArray[nameOneArray.length - 1] === nameTwoArray[0])) { // if initial in back of the first array and front of the 2nd array same
        nameOneArray.pop()
        name1 = nameOneArray.join(' ')

        nameTwoArray.shift()
        name2 = nameTwoArray.join(' ')

        return { initialDeletedNameOne: name1, initialDeletedNameTwo: name2 }

    }

    return false
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

    const isInitialChanged = isIntialChanged(name1, name2)
    if (isInitialChanged) {
        name1 = isInitialChanged.initialDeletedNameOne
        name2 = isInitialChanged.initialDeletedNameTwo
    }

    const distance = calculateLevenshteinDistance(name1, name2);
    return distance <= 3 // threshold
}

module.exports = { textCapitalize, formatDate, getMonthAndYear, findNumberOfDays, isNameSimilar }
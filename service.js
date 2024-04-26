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

const isNameSimilar = (name1, name2) => {
    const distance = calculateLevenshteinDistance(name1.toLowerCase(), name2.toLowerCase());
    return distance <= 3 // threshold
}

module.exports = { textCapitalize, formatDate, getMonthAndYear, findNumberOfDays, isNameSimilar }
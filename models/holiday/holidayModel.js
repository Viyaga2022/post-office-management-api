const mongoose = require('mongoose')

const holidaySchema = new mongoose.Schema(
    {
        holiday: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        }
    },
)

module.exports = mongoose.model('Holidays', holidaySchema)
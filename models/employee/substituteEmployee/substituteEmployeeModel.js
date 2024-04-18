const mongoose = require('mongoose')

const substituteEmployeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        accountNo: {
            type: String,
        },
        subdivisionName: {
            type: String,
            required: true,
            default: 'tirumangalam'
        },
        workStartDate: {
            type: Date,
        },
        workEndDate: {
            type: Date,
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
)

module.exports = mongoose.model('SubstituteEmployee', substituteEmployeeSchema)
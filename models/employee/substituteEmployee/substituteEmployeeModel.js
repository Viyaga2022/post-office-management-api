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
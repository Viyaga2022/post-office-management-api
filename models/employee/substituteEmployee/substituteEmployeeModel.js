const mongoose = require('mongoose')
const { union, number } = require('zod')

const substituteEmployeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        accountNo: {
            type: String,
            required: true,
            unique: true,
        },
        subdivisionName: {
            type: String,
            default: 'tirumangalam'
        },
        workStartDate: {
            type: Date,
            default: new Date(0),
        },
        workEndDate: {
            type: Date,
            default: new Date(0),
        },
        workingDays: {
            type: Number,
            dafault: 0,
        },
        status: {
            type: Number,
            enum: [0, 1],
            default: 1,
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
)

module.exports = mongoose.model('SubstituteEmployee', substituteEmployeeSchema)
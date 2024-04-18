const mongoose = require('mongoose')

const regularEmployeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        designation: {
            type: String,
        },
        officeName: {
            type: String,
        },
        subdivisionName: {
            type: String,
            required: true,
            default: 'tirumangalam'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
)

module.exports = mongoose.model('RegularEmployee', regularEmployeeSchema)
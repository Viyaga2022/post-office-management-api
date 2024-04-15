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
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
)

module.exports = mongoose.model('RegularEmployee', regularEmployeeSchema)
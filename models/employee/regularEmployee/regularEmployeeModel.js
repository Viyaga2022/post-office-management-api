const mongoose = require('mongoose')

const regularEmployeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        designation: {
            type: String,
            required: true,
        },
        officeId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Office",
            required: true,
        },
        officeName: {
            type: String,
            required: true,
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
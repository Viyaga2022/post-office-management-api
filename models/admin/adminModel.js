const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: [true, "Email already registered"],
        },
        password: {
            type: String,
            required: true
        },
        subdivisionName: {
            type: String,
            required: true,
            default: 'tirumangalam',
        }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Admin', adminSchema)
const mongoose = require('mongoose')

const officeSchema = new mongoose.Schema({
    officeName: {
        type: String,
        required: true,
    },
    subdivisionName: {
        type: String,
        required: true,
        default: 'tirumangalam'
    },
})

module.exports = mongoose.model('Office', officeSchema)
const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    employeeType: {
        type: String,
        required: true,
        enum: ['regular', 'substitute']
    },
    designation: {
        type: String,
    },
    officeName: {
        type: String,
    },
    accountNo: {
        type: String,
    }
})

module.exports = mongoose.model('Employee', employeeSchema)
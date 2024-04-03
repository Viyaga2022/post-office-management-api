const mongoose = require('mongoose')

const leaveSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
        enum: ['BPM', 'ABPM', 'Dak Sevak', 'ABPM I', 'ABPM II', 'ABPM III']
    },
    officeName: {
        type: String,
        required: true,
    },
    accountNo: {
        type: Number
    }
})

module.exports = mongoose.model('Employee', leaveSchema)
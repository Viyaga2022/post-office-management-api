const mongoose = require('mongoose')

const leaveSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        designation: {
            type: String,
            required: true,
            enum: ['BPM', 'ABPM', 'DAK SEVAK', 'ABPM I', 'ABPM II']
        },
        officeName: {
            type: String,
            required: true,
        },
        from: {
            type: Date,
            //required: true,
        },
        to: {
            type: Date,
            //required: true,
        },
        days: {
            type: Number,
            //required: true,
            //min: 1,
        },
        substituteName: {
            type: String,
            //required: true,
        },
        accountNo: {
            type: String,
            //required: true,
        },
        remarks: {
            type: String,
            //required: true,
        },
        leaveType: {
            type: String,
            //required: true,
        },
        postmanBeatNo: {
            type: String,
        },
        reference: {
            type: String,
        },
        sendToHoOn: {
            type: Date,
        },
        status: {
            type: Number,
            enum: [0, 1],
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Leave', leaveSchema)
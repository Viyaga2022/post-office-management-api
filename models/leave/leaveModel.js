const mongoose = require('mongoose')

const leaveSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        employeeId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            ref: "RegularEmployee"
        },
        designation: {
            type: String,
            required: true,
            enum: ['bpm', 'abpm', 'dak sevak', 'abpm i', 'abpm ii']
        },
        officeName: {
            type: String,
            required: true,
        },
        officeId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Office",
            required: true,
        },
        leaveMonth: {
            type: String, //jan2024
            required: true,
        },
        from: {
            type: Date,
            required: true,
        },
        to: {
            type: Date,
            required: true,
        },
        days: {
            type: Number,
            required: true,
            min: 1,
        },
        substituteId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "SubstituteEmployee",
            required: true,
        },
        substituteName: {
            type: String,
            required: true,
        },
        accountNo: {
            type: String,
            required: true,
        },
        remarks: {
            type: String,
            required: true,
        },
        leaveType: {
            type: String,
            required: true,
        },
        status: {
            type: Number,
            enum: [0, 1],
            default: 0,
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        subdivisionName: {
            type: String,
            required: true,
            default: 'tirumangalam'
        },
    },
)

module.exports = mongoose.model('Leave', leaveSchema)
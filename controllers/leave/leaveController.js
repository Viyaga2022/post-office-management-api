const ash = require('express-async-handler')
const fs = require('fs')
const csv = require('csv-parser')
const Leave = require('../../models/leave/leaveModel');
const { textCapitalize } = require('../../service');

const uploadLeaveToDB = ash(async (req, res) => {
    const results = []
    fs.createReadStream('files/')
        .pipe(csv())
        .on('data', (data) => {
            const selectedData = {
                name: data.name ? textCapitalize(data.name).trim() : "NO DATA",
                designation: data.designation.toUpperCase().trim(),
                officeName: textCapitalize(data.officeName).trim(),
                from: data.from,
                to: data.to,
                days: data.to - data.from,
                substituteName: textCapitalize(data.substituteName).trim(),
                accountNo: data.accountNo.trim(),
                remarks: data.remarks ? textCapitalize(data.remarks) : undefined,
                leaveType: textCapitalize(data.leaveType).trim(),
                postmanBeatNo: data.postmanBeatNo ? data.postmanBeatNo : undefined,
                reference: data.reference ? data.reference : undefined,
                sendToHoOn: data.sendToHoOn ? data.sendToHoOn : undefined,
            };
            results.push(selectedData);
        })
        .on('end', async () => {
            await Leave.insertMany(results);
            res.status(200).json({ message: "uploaded succesfully" })
        })
})

const createLeave = ash(async (req, res) => {
    try {
        const leave = new Leave(req.body);
        await leave.save();
        res.status(201).json({ success: true, data: leave });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

const getLeaves = ash(async (req, res) => {
    try {
        const leaves = await Leave.find();
        res.status(200).json({ success: true, data: leaves });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const getLeave = ash(async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave not found' });
        }
        res.status(200).json({ success: true, data: leave });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const updateLeave = ash(async (req, res) => {
    try {
        const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave not found' });
        }
        res.status(200).json({ success: true, data: leave });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const deleteLeave = ash(async (req, res) => {
    try {
        const leave = await Leave.findByIdAndDelete(req.params.id);
        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = { uploadLeaveToDB, createLeave, getLeaves, getLeave, updateLeave, deleteLeave }

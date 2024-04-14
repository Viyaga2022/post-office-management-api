const ash = require('express-async-handler')
const fs = require('fs')
const csv = require('csv-parser')
const z = require('zod')
const Leave = require('../../models/leave/leaveModel');
const { textCapitalize, formatDate, findNumberOfDaysBetweenDates } = require('../../service');

const uploadLeaveToDB = ash(async (req, res) => {
    const { fileName } = req.params
    const results = []
    fs.createReadStream(`files/${fileName}`)
        .pipe(csv())
        .on('data', (data) => {
            const selectedData = {
                name: data.name ? textCapitalize(data.name).trim() : "NO DATA",
                designation: data.designation.toUpperCase().trim(),
                officeName: textCapitalize(data.officeName).trim(),
                from: formatDate(data.from),
                to: formatDate(data.to),
                days: data.days ? parseInt(data.days) : undefined,
                substituteName: textCapitalize(data.substituteName).trim(),
                accountNo: data.accountNo ? data.accountNo.trim() : undefined,
                remarks: data.remarks ? textCapitalize(data.remarks) : undefined,
                leaveType: textCapitalize(data.leaveType).trim(),
                postmanBeatNo: data.postmanBeatNo ? data.postmanBeatNo : undefined,
                reference: data.reference ? data.reference : undefined,
                sendToHoOn: formatDate(data.sendToHoOn),
            };
            results.push(selectedData);
        })
        .on('end', async () => {
            await Leave.insertMany(results);
            res.status(200).json({ message: "uploaded succesfully" })
        })
})

const createLeave = ash(async (req, res) => {
    const { name, designation, officeName, from, to,
        substituteName, accountNo, remarks, leaveType, status } = req.body

    let days = 0
    if (from && to) {
        days = findNumberOfDaysBetweenDates(from, to)
    }

    const leaveData = {
        name, designation, officeName, from, to, days,
        substituteName, accountNo, remarks, leaveType, status:parseInt(status)
    }

    const isValidData = isValidLeaveData(leaveData)

    if (!isValidData?.success) return res.status(401).json({ message: "Invalid Data", error: isValidData.error })

    const date = new Date(2024, 9, 1)

    console.log({ body: req.body, date, isValidData });


    const leave = await Leave.create(leaveData);
    res.status(201).json({ success: true, data: leave });
});

const getLeaves = ash(async (req, res) => {
    const { leaveType } = req.params

    if (leaveType === 'pending') {
        const leaves = await Leave.find({ $or: [{ status: 0 }, { leaveType: "" }] });
        return res.status(200).json({ leaves });
    }

    const leaves = await Leave.find({ leaveType });
    res.status(200).json({ leaves });
});

const getLeave = ash(async (req, res) => {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
        return res.status(404).json({ success: false, error: 'Leave not found' });
    }
    res.status(200).json({ success: true, data: leave });
});

const updateLeave = ash(async (req, res) => {
    const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!leave) {
        return res.status(404).json({ success: false, error: 'Leave not found' });
    }
    res.status(200).json({ success: true, data: leave });
});

const deleteLeave = ash(async (req, res) => {
    const leave = await Leave.findByIdAndDelete(req.params.id);

    if (!leave) {
        return res.status(404).json({ message: 'Leave already approved or not found' });
    }

    res.status(200).json({ leaveId: req.params.id });
});

// common functions =========================================

const isValidLeaveData = (leaveData) => {

    let isValidData = false
    if (leaveData.status === 1) {
        isValidData = z.object({
            name: z.string().min(1).max(50),
            designation: z.string().min(1).max(10),
            officeName: z.string().min(1).max(50),
            from: z.string().max(100),
            to: z.string().max(100),
            days: z.number(),
            substituteName: z.string().max(50),
            accountNo: z.string().max(20),
            remarks: z.string().max(100),
            leaveType: z.string().max(100),
            status: z.number(),
        }).safeParse(leaveData)
    } else if (leaveData.status === 0) {
        isValidData = z.object({
            name: z.string().min(1).max(50),
            designation: z.string().min(1).max(10),
            officeName: z.string().min(1).max(50),
        }).safeParse(leaveData)
    }

    console.log({isValidData});
    return isValidData
}

module.exports = { uploadLeaveToDB, createLeave, getLeaves, getLeave, updateLeave, deleteLeave }

const ash = require('express-async-handler')
const fs = require('fs')
const csv = require('csv-parser')
const z = require('zod')
const Leave = require('../../models/leave/leaveModel');
const { formatDate } = require('../../service');

const uploadLeaveToDB = ash(async (req, res) => {
    const { fileName } = req.params
    const results = []
    fs.createReadStream(`files/${fileName}`)
        .pipe(csv())
        .on('data', (data) => {
            if (data?.substituteName) {
                const selectedData = {
                    name: data.name ? data.name.trim().toLowerCase() : "NO DATA",
                    designation: data.designation.trim().toLowerCase(),
                    officeName: data.officeName.trim().toLowerCase(),
                    from: formatDate(data.from),
                    to: formatDate(data.to),
                    days: data.days ? parseInt(data.days) : undefined,
                    substituteName: data.substituteName.trim().toLowerCase(),
                    accountNo: data.accountNo ? data.accountNo.trim() : undefined,
                    remarks: data.remarks ? data.remarks.trim().toLowerCase() : undefined,
                    leaveType: data.leaveType ? data.leaveType.trim().toLowerCase() : undefined,
                    status: 1,
                };
                results.push(selectedData);
            }
        })
        .on('end', async () => {
            await Leave.insertMany(results);
            res.status(200).json({ message: "uploaded succesfully" })
        })
})

const createLeave = ash(async (req, res) => {
    const { name, designation, officeName, from, to, days,
        substituteName, accountNo, remarks, leaveType, status } = req.body

    const parsedData = z.object({
        name: z.string().min(1).max(50),
        designation: z.string().min(1).max(10),
        officeName: z.string().min(1).max(50),
        from: z.string().min(1).max(40),
        to: z.string().min(1).max(40),
        substituteName: z.string().min(1).max(50),
        accountNo: z.string().min(1).max(20),
        remarks: z.string().min(1).max(100),
        leaveType: z.string().min(1).max(100),
        status: z.number().min(0).max(1),
    }).safeParse(req.body)

    if (!parsedData?.success) return res.status(401).json({ message: "Invalid Data" })

    const leaveData = {
        name, designation, officeName, from, to, days,
        substituteName, accountNo, remarks, leaveType, status
    }

    const leave = await Leave.create(leaveData);
    res.status(201).json({ message: "Leave Data Added Successfully", leave });
});

const getPendingLeaves = ash(async (req, res) => {
    const leaves = await Leave.find({ status: 0 });
    return res.status(200).json({ leaves });
});

const getLeavesByType = ash(async (req, res) => {
    const { leaveType } = req.params
    const leaves = await Leave.find({ leaveType, status: 1 });
    res.status(200).json({ leaves });
});

const updateLeave = ash(async (req, res) => {
    const { name, designation, officeName, from, to, days,
        substituteName, accountNo, remarks, leaveType, status } = req.body

    const id = req.params.id

    const parsedData = z.object({
        name: z.string().min(1).max(50),
        designation: z.string().min(1).max(10),
        officeName: z.string().min(1).max(50),
        from: z.string().min(1).max(40),
        to: z.string().min(1).max(40),
        substituteName: z.string().min(1).max(50),
        accountNo: z.string().min(1).max(20),
        remarks: z.string().min(1).max(100),
        leaveType: z.string().min(1).max(100),
        status: z.number().min(0).max(1),
    }).safeParse(req.body)

    if (!parsedData?.success) return res.status(401).json({ message: "Invalid Data" })

    const leaveData = {
        name, designation, officeName, from, to, days,
        substituteName, accountNo, remarks, leaveType, status
    }

    const leave = await Leave.findOneAndUpdate({ _id: id, status: 0 }, leaveData, { new: true, runValidators: true });

    if (!leave) {
        return res.status(404).json({ message: 'Leave not found or Already Approved' });
    }

    res.status(200).json({ message: "Data Updated Successfully", leave });
});

const deleteLeave = ash(async (req, res) => {
    const id = req.params.id
    const leave = await Leave.findOneAndDelete({ _id: id, status: 0 });

    if (!leave) {
        return res.status(404).json({ message: 'Leave not found or Already Approved' });
    }

    res.status(200).json({ message: "Data Deleted Successfully" });
});

module.exports = { uploadLeaveToDB, createLeave, getPendingLeaves, getLeavesByType, updateLeave, deleteLeave }

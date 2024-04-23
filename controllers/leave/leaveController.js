const ash = require('express-async-handler')
const fs = require('fs')
const csv = require('csv-parser')
const z = require('zod')
const Leave = require('../../models/leave/leaveModel');
const Office = require('../../models/office/OfficeModel')
const { formatDate, getMonthAndYear, textCapitalize } = require('../../service');

// common =================================================================
const uploadLeaveToDB = ash(async (req, res) => {
    const { fileName } = req.params
    const offices = await Office.find()
    const results = []
    fs.createReadStream(`files/${fileName}`)
        .pipe(csv())
        .on('data', (data) => {
            if (data?.substituteName) {
                const selectedData = {
                    name: data.name ? data.name.trim().toLowerCase() : "NO DATA",
                    designation: data.designation.trim().toLowerCase(),
                    officeId: offices.filter((item) => item.officeName === data.officeName.trim().toLowerCase().replace(" bo", ""))[0]?._id,
                    officeName: data.officeName.trim().toLowerCase().replace(" bo", ""),
                    from: formatDate(data.from),
                    to: formatDate(data.to),
                    leaveMonth: getMonthAndYear(formatDate(data.from)),
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

const validateOffice = async (fromDate, toDate, designation, officeId, leaveMonth) => {
    const data = await Leave.findOne({
        leaveMonth,
        officeId,
        designation,
        status: 1,
        $or: [
            { $and: [{ from: { $lte: fromDate } }, { to: { $gte: fromDate } }] }, // fromDate falls within leave period
            { $and: [{ from: { $lte: toDate } }, { to: { $gte: toDate } }] },     // toDate falls within leave period
            { $and: [{ from: { $gte: fromDate } }, { to: { $lte: toDate } }] }   // leave period falls within fromDate and toDate
        ]
    }).select('substituteName')
    return data
}

const validateSubstitute = async (fromDate, toDate, accountNo, leaveMonth) => {
    const data = await Leave.findOne({
        leaveMonth,
        accountNo,
        status: 1,
        $or: [
            { $and: [{ from: { $lte: fromDate } }, { to: { $gte: fromDate } }] }, // fromDate falls within leave period
            { $and: [{ from: { $lte: toDate } }, { to: { $gte: toDate } }] },     // toDate falls within leave period
            { $and: [{ from: { $gte: fromDate } }, { to: { $lte: toDate } }] }   // leave period falls within fromDate and toDate
        ]
    }).select('officeName')
    return data
}

// crud =============================================================================
const createLeave = ash(async (req, res) => {
    const { name, designation, officeId, officeName, leaveMonth, from, to, days,
        substituteName, accountNo, remarks, leaveType, status } = req.body

    const parsedData = z.object({
        name: z.string().min(1).max(50),
        designation: z.string().min(1).max(10),
        officeId: z.string().min(1).max(30),
        officeName: z.string().min(1).max(50),
        leaveMonth: z.string().min(1).max(9),
        from: z.string().min(1).max(40),
        to: z.string().min(1).max(40),
        days: z.number().min(1).max(33),
        substituteName: z.string().min(1).max(50),
        accountNo: z.string().min(1).max(20),
        remarks: z.string().min(1).max(100),
        leaveType: z.string().min(1).max(100),
        status: z.number().min(0).max(1),
    }).safeParse(req.body)

    if (!parsedData?.success) return res.status(401).json({ message: "Invalid Data" })

    const isSubstitute = await validateOffice(from, to, designation, officeId, leaveMonth)
    if (isSubstitute) {
        const message = textCapitalize(`${isSubstitute.substituteName} is Already scheduled to work as a ${designation} in this office.`)
        return res.status(401).json({ message })
    }

    const isOfficeName = await validateSubstitute(from, to, accountNo, leaveMonth)
    if (isOfficeName) {
        const message = textCapitalize(`This substitute is already scheduled to work at ${isOfficeName.officeName} on this date.`)
        return res.status(401).json({ message })
    }

    const leaveData = {
        name, designation, officeId, officeName, leaveMonth, from, to, days,
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
    const { leaveType, fromDate, toDate } = req.params
    const leaves = await Leave.find({ leaveType, status: 1, from: { $gte: fromDate, $lte: toDate } }).sort({ from: 1 });
    res.status(200).json({ leaves });
});

const updateLeave = ash(async (req, res) => {
    const { name, designation, officeId, officeName, leaveMonth, from, to, days,
        substituteName, accountNo, remarks, leaveType, status } = req.body

    const id = req.params.id

    const parsedData = z.object({
        name: z.string().min(1).max(50),
        designation: z.string().min(1).max(10),
        officeId: z.string().min(1).max(30),
        officeName: z.string().min(1).max(50),
        leaveMonth: z.string().min(1).max(9),
        from: z.string().min(1).max(40),
        to: z.string().min(1).max(40),
        days: z.number().min(1).max(33),
        substituteName: z.string().min(1).max(50),
        accountNo: z.string().min(1).max(20),
        remarks: z.string().min(1).max(100),
        leaveType: z.string().min(1).max(100),
        status: z.number().min(0).max(1),
    }).safeParse(req.body)

    if (!parsedData?.success) return res.status(401).json({ message: "Invalid Data" })

    const isSubstitute = await validateOffice(from, to, designation, officeId, leaveMonth)
    if (isSubstitute) {
        const message = textCapitalize(`${isSubstitute.substituteName} is Already scheduled to work as a ${designation} in this office.`)
        return res.status(401).json({ message })
    }

    const isOfficeName = await validateSubstitute(from, to, accountNo, leaveMonth)
    if (isOfficeName) {
        const message = textCapitalize(`This substitute is already scheduled to work at ${isOfficeName.officeName} on this date.`)
        return res.status(401).json({ message })
    }

    const leaveData = {
        name, designation, officeId, officeName, leaveMonth, from, to, days,
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

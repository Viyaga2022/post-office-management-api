const ash = require('express-async-handler')
const fs = require('fs')
const csv = require('csv-parser')
const z = require('zod')
const Leave = require('../../models/leave/leaveModel');
const Office = require('../../models/office/OfficeModel')
const RegularEmployees = require('../../models/employee/regularEmployee/regularEmployeeModel')
const Substitutes = require('../../models/employee/substituteEmployee/substituteEmployeeModel')
const { formatDate, getMonthAndYear, textCapitalize, isNameSimilar } = require('../../service');
const { parse } = require('path');

// common =================================================================
const uploadLeaveToDB = ash(async (req, res) => {
    const { fileName } = req.params
    const offices = await Office.find()
    const employees = await RegularEmployees.find()
    const substitutes = await Substitutes.find()

    const results = []
    fs.createReadStream(`files/${fileName}`)
        .pipe(csv())
        .on('data', (data) => {
            if (data?.substituteName && data?.accountNo) {
                const selectedData = {
                    employeeId: employees.filter((item) => {
                        const offName = item.officeName === data.officeName.trim().toLowerCase().replace(" bo", "")
                        const name = isNameSimilar(item.name, data.name.trim().toLowerCase())
                        if (offName && name) return true
                        return false
                    })[0]?._id,
                    name: data.name ? data.name.trim().toLowerCase() : "NO DATA",
                    designation: data.designation.trim().toLowerCase(),
                    officeId: offices.filter((item) => item.officeName === data.officeName.trim().toLowerCase().replace(" bo", ""))[0]?._id,
                    officeName: data.officeName.trim().toLowerCase().replace(" bo", ""),
                    from: formatDate(data.from),
                    to: formatDate(data.to),
                    leaveMonth: getMonthAndYear(formatDate(data.from)),
                    days: data.days ? parseInt(data.days) : undefined,
                    substituteId: substitutes.filter((item) => item.accountNo === data.accountNo.trim())[0]?._id,
                    substituteName: data.substituteName.trim().toLowerCase(),
                    accountNo: data.accountNo ? data.accountNo.trim() : undefined,
                    remarks: data.remarks ? data.remarks.trim().toLowerCase() : undefined,
                    leaveType: data.leaveType ? data.leaveType.trim().toLowerCase() : undefined,
                    status: 1,
                };

                if (!selectedData.substituteId) {

                }
                results.push(selectedData);

            }
        })
        .on('end', async () => {
            await Leave.insertMany(results);
            res.status(200).json({ message: "data uploaded", results })
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

const validatePaidLeave = async (from, employeeId, days) => {
    const year = new Date(from).getFullYear()
    const month = new Date(from).getMonth()

    let monthsHalf = [`jan${year}`, `feb${year}`, `mar${year}`, `apr${year}`, `may${year}`, `jun${year}`];
    let halfYear = "First Half"
    if (month > 5) {
        monthsHalf = [`jul${year}`, `aug${year}`, `sep${year}`, `oct${year}`, `nov${year}`, `dec${year}`];
        halfYear = "Second Half"
    }

    const leaves = await Leave.find({ employeeId, leaveType: "paid leave", leaveMonth: { $in: monthsHalf }, status: 1, }).select(['days', '-_id'])

    let totalLeaveDays = 0
    for (const leave of leaves) {
        totalLeaveDays += leave.days
    }

    if ((totalLeaveDays + days) <= 10) return null
    return { totalLeaveDays, halfYear }
}

// crud =============================================================================
const createLeave = ash(async (req, res) => {
    const { name, employeeId, designation, officeId, officeName, leaveMonth, from, to, days,
        substituteName, substituteId, accountNo, remarks, leaveType, status } = req.body

    const parsedData = z.object({
        name: z.string().min(1).max(50),
        employeeId: z.string().min(1).max(30),
        designation: z.string().min(1).max(20),
        officeName: z.string().min(1).max(50),
        officeId: z.string().min(1).max(30),
        leaveMonth: z.string().min(1).max(9),
        from: z.string().min(1).max(40),
        to: z.string().min(1).max(40),
        days: z.number().min(1).max(33),
        substituteName: z.string().min(1).max(50),
        substituteId: z.string().min(1).max(30),
        accountNo: z.string().min(1).max(20),
        remarks: z.string().min(1).max(100),
        leaveType: z.string().min(1).max(100),
        status: z.number().min(0).max(1),
    }).safeParse(req.body)

    if (!parsedData?.success) return res.status(401).json({ message: "Invalid Data" })

    if (new Date(from).getMonth() !== new Date(to).getMonth()) return res.status(401).json("Send separate leave letters for different months")

    const isValidOffice = await validateOffice(from, to, designation, officeId, leaveMonth)
    if (isValidOffice) {
        const message = textCapitalize(`${isValidOffice.substituteName} is Already scheduled to work as a ${designation} in this office.`)
        return res.status(401).json({ message })
    }

    const isValidSubstitute = await validateSubstitute(from, to, accountNo, leaveMonth)
    if (isValidSubstitute) {
        const message = textCapitalize(`This substitute is already scheduled to work at ${isValidSubstitute.officeName} on this date.`)
        return res.status(401).json({ message })
    }

    if (leaveType === 'paid leave') {
        if (days > 10) return res.status(401).json({ message: "Paid Leave must be less than 10 days" })

        const isValidPaidLeave = await validatePaidLeave(from, employeeId, days)
        if (isValidPaidLeave) {
            const message = textCapitalize(`this employee has already taken ${isValidPaidLeave.totalLeaveDays} days of paid leave in the ${isValidPaidLeave.halfYear} of the year `)
            return res.status(401).json({ message })
        }
    }

    const leaveData = {
        name, employeeId, designation, officeId, officeName, leaveMonth, from, to, days,
        substituteName, substituteId, accountNo, remarks, leaveType, status
    }

    const leave = await Leave.create(leaveData);
    res.status(201).json({ message: "Leave Data Added Successfully", leave });
});

const getPendingLeaves = ash(async (req, res) => {
    const leaves = await Leave.find({ status: 0 });
    return res.status(200).json({ leaves });
});

const getLeavesByType = ash(async (req, res) => {
    const { leaveType, fromDate, toDate, officeId, employeeId, substituteId, remarks } = req.params
    const filter = {}

    if (parseInt(leaveType) !== 0) filter.leaveType = leaveType
    if (parseInt(officeId) !== 0) filter.officeId = officeId
    if (parseInt(employeeId) !== 0) filter.employeeId = employeeId
    if (parseInt(substituteId) !== 0) filter.substituteId = substituteId
    if (parseInt(remarks) !== 0) filter.remarks = remarks


    const leaves = await Leave.find({ status: 1, ...filter, from: { $gte: fromDate, $lte: toDate } }).sort({ from: 1 });
    res.status(200).json({ leaves });
});

const updateLeave = ash(async (req, res) => {
    const { name, employeeId, designation, officeId, officeName, leaveMonth, from, to, days,
        substituteName, substituteId, accountNo, remarks, leaveType, status } = req.body

    const id = req.params.id

    const parsedData = z.object({
        name: z.string().min(1).max(50),
        employeeId: z.string().min(1).max(30),
        designation: z.string().min(1).max(20),
        officeName: z.string().min(1).max(50),
        officeId: z.string().min(1).max(30),
        leaveMonth: z.string().min(1).max(9),
        from: z.string().min(1).max(40),
        to: z.string().min(1).max(40),
        days: z.number().min(1).max(33),
        substituteName: z.string().min(1).max(50),
        substituteId: z.string().min(1).max(30),
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

    if (leaveType === 'paid leave') {
        if (days > 10) return res.status(401).json({ message: "Paid Leave must be less than 10 days" })

        const isValidPaidLeave = await validatePaidLeave(from, employeeId, days)
        if (isValidPaidLeave) {
            const message = textCapitalize(`this employee has already taken ${isValidPaidLeave.totalLeaveDays} days of paid leave in the ${isValidPaidLeave.halfYear} of the year `)
            return res.status(401).json({ message })
        }
    }

    const leaveData = {
        name, employeeId, designation, officeId, officeName, leaveMonth, from, to, days,
        substituteName, substituteId, accountNo, remarks, leaveType, status
    }

    const leave = await Leave.findOneAndUpdate({ _id: id, status: 0 }, leaveData, { new: true, runValidators: true });

    if (!leave) {
        return res.status(404).json({ message: 'Leave not found or Already Approved' });
    }

    res.status(200).json({ message: "Data Updated Successfully", leave });
});

const cancelApproval = ash(async (req, res) => {
    const id = req.params.id
    const leave = await Leave.findOneAndUpdate({ _id: id, status: 1 }, { status: 0 });

    if (!leave) {
        return res.status(404).json({ message: "The leave you're looking for is either not found or is pending" });
    }

    res.status(200).json({ message: "Cancellation successful." });
})

const deleteLeave = ash(async (req, res) => {
    const id = req.params.id
    const leave = await Leave.findOneAndDelete({ _id: id, status: 0 });

    if (!leave) {
        return res.status(404).json({ message: 'Leave not found or Already Approved' });
    }

    res.status(200).json({ message: "Data Deleted Successfully" });
});

module.exports = {
    uploadLeaveToDB, createLeave, getPendingLeaves, getLeavesByType,
    updateLeave, cancelApproval, deleteLeave
}

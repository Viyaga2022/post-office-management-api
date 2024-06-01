const ash = require('express-async-handler')
const SubstituteEmployee = require('../../../models/employee/substituteEmployee/substituteEmployeeModel');
const RegularEmployees = require('../../../models/employee/regularEmployee/regularEmployeeModel')
const Holiday = require('../../../models/holiday/holidayModel');
const fs = require('fs')
const csv = require('csv-parser');
const { z } = require('zod');

const uploadSubstituteEmployeesToDB = ash(async (req, res) => {
    const { fileName } = req.params
    const results = [];

    fs.createReadStream(`./files/${fileName}`) //./files/employee-details.csv
        .pipe(csv())
        .on('data', (data) => {
            if (data.accountNo) {
                const selectedData = {
                    name: data.name.trim().toLowerCase(),
                    accountNo: data.accountNo,
                };
                results.push(selectedData);
            }
        })
        .on('end', async () => {
            await SubstituteEmployee.insertMany(results);
            res.status(200).json({ message: "uploaded succesfully" })
        })
})

const createSubstituteEmployee = ash(async (req, res) => {
    const { name, accountNo } = req.body

    const parsedData = z.object({
        name: z.string().min(1).max(50),
        accountNo: z.string().min(1).max(20),
    }).safeParse(req.body)

    if (parsedData.success) {
        const isExisting = await SubstituteEmployee.findOne({ accountNo, status: 1 })
        if (isExisting) return res.status(401).json({ message: "Account No Already Existing" })

        const employee = await SubstituteEmployee.create({ name, accountNo });
        return res.status(201).json({ message: "Employee Created Successfully", employee });
    }

    res.status(401).json({ message: "Invalid Data" })

});

const getAllSubstituteEmployees = ash(async (req, res) => {
    const employees = await SubstituteEmployee.find({ status: 1, name: { $ne: "combined duty" } }).select(['name', 'accountNo', 'workStartDate', 'workEndDate', 'workingDays']);
    res.status(201).json({ employees });
});

const getSubstitutesRegularEmployeeAndHolidays = ash(async (req, res) => {
    const substitutes = await SubstituteEmployee.find({ status: 1 }).select(['name', 'accountNo']).sort({ name: 1 });

    const employees = await RegularEmployees.find({ status: 1 }).select(['name', 'designation', 'officeId', 'officeName']).sort({ name: 1 })

    const holidays = await Holiday.find().select(['holiday', 'date', '-_id']);

    res.status(201).json({ substitutes, employees, holidays });
})


const getSubstitutesAndRegularEmployees = ash(async (req, res) => {
    const substitutes = await SubstituteEmployee.find({ status: 1 }).select(['name', 'accountNo']).sort({ name: 1 });

    const employees = await RegularEmployees.find({ status: 1 }).select(['name', 'designation', 'officeId', 'officeName']).sort({ name: 1 })

    res.status(201).json({ substitutes, employees });
})

const getNonWorkingSubstitute = ash(async (req, res) => {
    const { fromDate, toDate } = req.params
    const employees = await SubstituteEmployee.find({
        status: 1,
        $and: [
            {
                $or: [
                    { workStartDate: { $lt: fromDate } },
                    { workEndDate: { $gt: fromDate } }
                ]
            }, {
                $or: [
                    { workStartDate: { $lt: toDate } },
                    { workEndtDate: { $gt: toDate } }
                ]
            }]
    }).select(['name', 'accountNo'])

    res.status(201).json({ employees });
})

const getSubstituteEmployeeById = ash(async (req, res) => {
    const employee = await SubstituteEmployee.findOne({ _id: req.params.id, status: 1 });
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ employee });
});

const updateSubstituteEmployee = ash(async (req, res) => {
    const { name, accountNo } = req.body
    const id = req.params.id

    const parsedData = z.object({
        name: z.string().min(1).max(50),
        accountNo: z.string().min(1).max(20),
    }).safeParse(req.body)

    if (parsedData.success) {
        const isExisting = await SubstituteEmployee.findOne({ accountNo, status: 1 })
        if (isExisting && (isExisting._id.toString() !== id)) return res.status(401).json({ message: "Account No Already Existing" })

        const employee = await SubstituteEmployee.findOneAndUpdate({ _id: id, status: 1 }, { name, accountNo }, { new: true });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        return res.status(201).json({ message: "Employee Updated Successfully", employee });
    }

    res.status(401).json({ message: "Invalid Data" })
});

const deleteSubstituteEmployee = ash(async (req, res) => {
    const employee = await SubstituteEmployee.findByIdAndUpdate(req.params.id, { status: -1 });
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully', employee });
});

module.exports = {
    uploadSubstituteEmployeesToDB, createSubstituteEmployee, getAllSubstituteEmployees, getSubstitutesRegularEmployeeAndHolidays,
    getSubstitutesAndRegularEmployees, getNonWorkingSubstitute, getSubstituteEmployeeById, updateSubstituteEmployee, deleteSubstituteEmployee
}



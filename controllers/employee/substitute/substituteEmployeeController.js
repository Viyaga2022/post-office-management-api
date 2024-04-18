const ash = require('express-async-handler')
const SubstituteEmployee = require('../../../models/employee/substituteEmployee/substituteEmployeeModel');
const fs = require('fs')
const csv = require('csv-parser');
const { z } = require('zod');
const { log } = require('console');

const uploadSubstituteEmployeesToDB = ash(async (req, res) => {
    const { fileName } = req.params
    const results = [];
    c
    fs.createReadStream(`./files/${fileName}`) //./files/employee-details.csv
        .pipe(csv())
        .on('data', (data) => {
            const selectedData = {
                name: data.name ? data.name.trim().toLowerCase() : "NO DATA",
                accountNo: data.officeName ? undefined : data.accountNo.trim().toLowerCase(),
            };
            results.push(selectedData);
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
        const employee = await SubstituteEmployee.create({ name, accountNo });
        res.status(201).json({ message: "Employee Created Successfully", employee });
    }

    res.status(401).json({ message: "Invalid Data" })

});

const getAllSubstituteEmployees = ash(async (req, res) => {
    const employees = await SubstituteEmployee.find();
    res.json({ employees });
});

const getSubstituteEmployeeById = ash(async (req, res) => {
    const employee = await SubstituteEmployee.findById(req.params.id);
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
        const employee = await SubstituteEmployee.findByIdAndUpdate(id, { name, accountNo }, { new: true });
        return res.status(201).json({ message: "Employee Updated Successfully", employee });
    }

    res.status(401).json({ message: "Invalid Data" })
});

const deleteSubstituteEmployee = ash(async (req, res) => {
    const employee = await SubstituteEmployee.findByIdAndDelete(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully', employee });
});

module.exports = {
    uploadSubstituteEmployeesToDB, createSubstituteEmployee, getAllSubstituteEmployees,
    getSubstituteEmployeeById, updateSubstituteEmployee, deleteSubstituteEmployee
}



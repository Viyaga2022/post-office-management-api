const ash = require('express-async-handler')
const SubstituteEmployee = require('../../../models/employee/substituteEmployee/substituteEmployeeModel');
const fs = require('fs')
const csv = require('csv-parser');

const uploadSubstituteEmployeesToDB = ash(async (req, res) => {
    const { fileName } = req.params
    const results = [];

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
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
});

const getAllSubstituteEmployees = ash(async (req, res) => {
    const { employeeType } = req.params
    const employees = await Employee.find({ employeeType });
    res.json({ employees });
});

const getSubstituteEmployeeById = ash(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
});

const updateSubstituteEmployee = ash(async (req, res) => {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
});

const deleteSubstituteEmployee = ash(async (req, res) => {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
});

module.exports = {
    uploadSubstituteEmployeesToDB, createSubstituteEmployee, getAllSubstituteEmployees,
    getSubstituteEmployeeById, updateSubstituteEmployee, deleteSubstituteEmployee
}



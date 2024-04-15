const ash = require('express-async-handler')
const RegularEmployee = require('../../../models/employee/regularEmployee/regularEmployeeModel');
const fs = require('fs')
const csv = require('csv-parser');

const uploadRegularEmployeesToDB = ash(async (req, res) => {
    const { fileName } = req.params
    const results = [];

    fs.createReadStream(`./files/${fileName}`) //./files/employee-details.csv
        .pipe(csv())
        .on('data', (data) => {
            const selectedData = {
                name: data.name ? data.name.trim().toLowerCase() : "NO DATA",
                designation: data.officeName ? data.designation.trim().toLowerCase() : undefined,
                officeName: data.officeName ? data.officeName.trim().toLowerCase() : undefined,
            };
            results.push(selectedData);
        })
        .on('end', async () => {
            await RegularEmployee.insertMany(results);
            res.status(200).json({ message: "uploaded succesfully" })
        })
})

const createRegularEmployee = ash(async (req, res) => {
    const employee = new RegularEmployee(req.body);
    await employee.save();
    res.status(201).json(employee);
});

const getAllOffices = ash(async (req, res) => {
    const offices = await Employee.distinct('officeName', { employeeType: 'regular' });
    res.json({ offices, total: offices.length });
});

const getAllRegularEmployees = ash(async (req, res) => {
    const employees = await RegularEmployee.find();
    res.json({ employees });
});

const getRegularEmployeeById = ash(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
});

const updateRegularEmployee = ash(async (req, res) => {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
});

const deleteRegularEmployee = ash(async (req, res) => {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
});

module.exports = {
    uploadRegularEmployeesToDB, createRegularEmployee, getAllOffices,
    getAllRegularEmployees, getRegularEmployeeById, updateRegularEmployee, deleteRegularEmployee
}



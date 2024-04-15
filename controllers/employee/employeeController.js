const ash = require('express-async-handler')
const Employee = require('../../models/employee/employeeModel');
const fs = require('fs')
const csv = require('csv-parser');
const { textCapitalize } = require('../../service');

const uploadEmployeesToDB = ash(async (req, res) => {
    const { fileName } = req.params
    const results = [];

    fs.createReadStream(`./files/${fileName}`) //./files/employee-details.csv
        .pipe(csv())
        .on('data', (data) => {
            const selectedData = {
                name: data.name ? data.name.trim().toLowerCase() : "NO DATA",
                employeeType: data.officeName ? "regular" : "substitute",
                designation: data.officeName ? data.designation.trim().toLowerCase() : undefined,
                officeName: data.officeName ? data.officeName.trim().toLowerCase() : undefined,
                accountNo: data.officeName ? undefined : data.accountNo.trim().toLowerCase(),
            };
            results.push(selectedData);
        })
        .on('end', async () => {
            await Employee.insertMany(results);
            res.status(200).json({ message: "uploaded succesfully" })
        })
})

// Create a new employee
const createEmployee = ash(async (req, res) => {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
});

const getAllOffices = ash(async (req, res) => {
    const offices = await Employee.distinct('officeName', { employeeType: 'regular' });
    res.json({ offices, total: offices.length });
});

// Get all employees
const getAllEmployees = ash(async (req, res) => {
    const { employeeType } = req.params
    const employees = await Employee.find({ employeeType });
    res.json({ employees });
});

// Get a single employee by ID
const getEmployeeById = ash(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
});

// Update an employee
const updateEmployee = ash(async (req, res) => {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
});

// Delete an employee
const deleteEmployee = ash(async (req, res) => {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
});

module.exports = { uploadEmployeesToDB, createEmployee, getAllOffices, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee }



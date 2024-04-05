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
                name: data.name ? textCapitalize(data.name).trim() : "NO DATA",
                employeeType: data.officeName ? "regular" : "substitute",
                designation: data.officeName ? data.designation.toUpperCase().trim() : undefined,
                officeName: data.officeName ? textCapitalize(data.officeName).trim() : undefined,
                accountNo: data.officeName ? undefined : textCapitalize(data.accountNo).trim(),
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
    try {
        const employee = new Employee(req.body);
        await employee.save();
        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all employees
const getAllEmployees = ash(async (req, res) => {
    const { employeeType } = req.params

    try {
        const employees = await Employee.find({ employeeType });
        res.json({ employees });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single employee by ID
const getEmployeeById = ash(async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an employee
const updateEmployee = ash(async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete an employee
const deleteEmployee = ash(async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = { uploadEmployeesToDB, createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee }



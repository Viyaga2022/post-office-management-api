const ash = require('express-async-handler')
const RegularEmployee = require('../../../models/employee/regularEmployee/regularEmployeeModel');
const Office = require('../../../models/office/OfficeModel')
const fs = require('fs')
const csv = require('csv-parser');
const { z } = require('zod');
const { textCapitalize } = require('../../../service');

const uploadRegularEmployeesToDB = ash(async (req, res) => {
    const { fileName } = req.params
    const results = [];
    const offices = await Office.find()
    fs.createReadStream(`./files/${fileName}`) //./files/employee-details.csv
        .pipe(csv())
        .on('data', (data) => {
            const selectedData = {
                name: data.name ? data.name.trim().toLowerCase() : "VACANT",
                designation: data.officeName ? data.designation.trim().toLowerCase() : undefined,
                officeId: offices.filter((item) => item.officeName === data.officeName.trim().toLowerCase().replace(" bo", ""))[0]?._id,
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
    const { name, designation, officeId, officeName } = req.body

    const parsedData = z.object({
        name: z.string().min(1).max(50),
        designation: z.string().min(1).max(20),
        officeName: z.string().min(1).max(50),
    }).safeParse(req.body)

    if (parsedData?.success) {
        const isExisting = await RegularEmployee.findOne({ designation, officeId })
        if (isExisting) {
            const message = textCapitalize(`${designation} was already existing in ${officeName}`)
            return res.status(401).json({ message })
        }

        const employee = await RegularEmployee.create({ name, designation, officeId, officeName });
        return res.status(201).json({ message: "Employee Created Successfully", employee });
    }

    res.status(401).json({ message: "Invalid Data" })
});

const getAllOffices = ash(async (req, res) => {
    const offices = await Employee.distinct('officeName');
    res.status(200).json({ offices });
});

const getAllRegularEmployees = ash(async (req, res) => {
    const employees = await RegularEmployee.find();
    res.json({ employees });
});

const getRegularEmployeeById = ash(async (req, res) => {
    const employee = await RegularEmployee.findById(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ employee });
});

const getEmployeeNameByOfficeIdAndDesignation = ash(async (req, res) => {
    const { officeId, designation } = req.params
    const employeeData = await RegularEmployee.findOne({ officeId, designation }).select('name');
    if (!employeeData) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ employeeName: employeeData.name });
});

const updateRegularEmployee = ash(async (req, res) => {
    const { name, designation, officeId, officeName } = req.body
    const id = req.params.id

    const parsedData = z.object({
        name: z.string().min(1).max(50),
        designation: z.string().min(1).max(20),
        officeId: z.string().min(1).max(30),
        officeName: z.string().min(1).max(50),
    }).safeParse(req.body)

    if (parsedData?.success) {
        const isExisting = await RegularEmployee.findOne({ designation, officeId })
        console.log({ isExisting: isExisting._id, id });
        if ((isExisting) && (isExisting._id.toString() !== id)) {
            const message = textCapitalize(`${designation} was already existing in ${officeName}`)
            return res.status(401).json({ message })
        }

        const employee = await RegularEmployee.findByIdAndUpdate(id, { name, designation, officeId, officeName }, { new: true });
        return res.status(201).json({ message: "Employee Updated Successfully", employee });
    }

    res.status(401).json({ message: "Invalid Data" })
});

const deleteRegularEmployee = ash(async (req, res) => {
    const employee = await RegularEmployee.findByIdAndDelete(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully', employee });
});

module.exports = {
    uploadRegularEmployeesToDB, createRegularEmployee, getAllOffices, getAllRegularEmployees,
    getRegularEmployeeById, getEmployeeNameByOfficeIdAndDesignation, updateRegularEmployee, deleteRegularEmployee
}



const ash = require('express-async-handler')
const RegularEmployees = require('../../models/employee/regularEmployee/regularEmployeeModel');
const Office = require('../../models/office/OfficeModel');
const { z } = require('zod');

const uploadOffices = ash(async (req, res) => {
    const offices = await RegularEmployees.distinct('officeName');
    const officeObj = offices.map((item) => ({ officeName: item.toLowerCase().replace(' bo', '') }))
    await Office.insertMany(officeObj)
    res.status(201).json({ message: "Office Uploaded Successfully" })
});

const getAllOffices = ash(async (req, res) => {
    const offices = await Office.find()
    res.status(201).json({ offices })
});

module.exports = { uploadOffices, getAllOffices }
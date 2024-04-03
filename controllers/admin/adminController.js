const ash = require('express-async-handler')
const Admin = require('../../models/admin/adminModel');

createAdmin = ash(async (req, res) => {
    try {
        const employee = new Admin(req.body);
        await employee.save();
        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = { createAdmin }
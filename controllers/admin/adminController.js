const ash = require('express-async-handler')
const Admin = require('../../models/admin/adminModel');

createAdmin = ash(async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !emaill || !password) return res.status(404).json({ message: "Please Enter the required field" })

    const isExisting = await Admin.findOne({ email })
    if (isExisting) return res.status(401).json({ message: "Email Already Registerd" })

    const employee = await Admin.create({ name, email, password })
    res.status(201).json({ success: "employee created Successfully" });
});

module.exports = { createAdmin }
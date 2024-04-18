const ash = require('express-async-handler')
const Holiday = require('../../models/holiday/holidayModel');
const { z } = require('zod');

const createHoliday = ash(async (req, res) => {
    const { holiday, date } = req.body

    const parsedData = z.object({
        holiday: z.string().min(1).max(50),
        date: z.string().min(1).max(50),
    }).safeParse(req.body)

    if (parsedData.success) {
        const holidayData = await Holiday.create({ holiday, date });
        return res.status(201).json({ message: "Holiday Added Successfully", holiday: holidayData });
    }

    res.status(401).json({ message: "Invalid Data" })

});

const getAllHolidays = ash(async (req, res) => {
    const holidays = await Holiday.find();
    console.log({holidays});
    res.status(200).json({ holidays });
});

const getHolidayById = ash(async (req, res) => {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
        return res.status(404).json({ message: 'Holiday not found' });
    }
    res.status(200).json({ holiday });
});

const updateHoliday = ash(async (req, res) => {
    const { holiday, date } = req.body
    const id = req.params.id

    const parsedData = z.object({
        holiday: z.string().min(1).max(50),
        date: z.string().min(1).max(50),
    }).safeParse(req.body)

    if (parsedData.success) {
        const holiday = await Holiday.findByIdAndUpdate(id, { holiday, date }, { new: true });
        return res.status(201).json({ message: "Holiday Updated Successfully", holiday });
    }

    res.status(401).json({ message: "Invalid Data" })
});

const deleteHoliday = ash(async (req, res) => {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) {
        return res.status(404).json({ message: 'Holiday not found' });
    }
    res.json({ message: 'Holiday deleted successfully', holiday });
});

module.exports = {
    createHoliday, getAllHolidays,
    getHolidayById, updateHoliday, deleteHoliday
}



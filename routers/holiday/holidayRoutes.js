const express = require('express')
const router = express()

const { createHoliday, getAllHolidays, getHolidayById, updateHoliday, deleteHoliday } = require('../../controllers/holiday/holidayController');
const { protect } = require('../../middlewares/auth/authMiddleware');

router.post('/', createHoliday);

router.get('/', getAllHolidays);

router.get('/:id', getHolidayById);

router.put('/:id', updateHoliday);

router.delete('/:id', deleteHoliday);


module.exports = router;

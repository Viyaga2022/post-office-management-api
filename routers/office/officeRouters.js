const express = require('express')
const router = express()

const { protect } = require('../../middlewares/auth/authMiddleware');
const { uploadOffices, getAllOffices } = require('../../controllers/office/officeController');

router.get('/upload', uploadOffices);

router.get('/', getAllOffices)

module.exports = router;

const express = require('express');
const { createAdmin } = require('../../controllers/admin/adminController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const router = express()

router.post('/', createAdmin);

module.exports = router
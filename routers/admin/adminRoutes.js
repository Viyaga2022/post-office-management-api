const express = require('express');
const { createAdmin } = require('../../controllers/admin/adminController');
const router = express()

router.post('/', createAdmin);

module.exports = router
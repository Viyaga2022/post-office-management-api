const express = require('express');
const { uploadLeaveToDB, createLeave, getLeaves, getLeave, updateLeave, deleteLeave } = require('../../controllers/leave/leaveController');
const router = express()

router.post('/', createLeave);

router.get('/upload/:fileName', uploadLeaveToDB);

router.get('/:leaveType', getLeaves);

router.get('/:id', getLeave);

router.put('/:id', updateLeave);

router.delete('/:id', deleteLeave);

module.exports = router
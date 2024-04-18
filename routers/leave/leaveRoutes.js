const express = require('express');
const { uploadLeaveToDB, createLeave, updateLeave, deleteLeave, getLeavesByType, getPendingLeaves } = require('../../controllers/leave/leaveController');
const router = express()

router.post('/', createLeave);

router.get('/upload/:fileName', uploadLeaveToDB);

router.get('/pending', getPendingLeaves)

router.put('/pending/:id', updateLeave);

router.delete('/pending/:id', deleteLeave);

router.get('/:leaveType', getLeavesByType);

module.exports = router
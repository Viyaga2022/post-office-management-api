const express = require('express');
const {
    uploadLeaveToDB, createLeave, updateLeave, deleteLeave,
    getLeavesByType, getPendingLeaves, cancelApproval
} = require('../../controllers/leave/leaveController');

const router = express()

router.post('/', createLeave);

router.get('/upload/:fileName', uploadLeaveToDB);

router.get('/pending', getPendingLeaves)

router.put('/pending/:id', updateLeave);

router.patch('/approved/:id', cancelApproval);

router.delete('/pending/:id', deleteLeave);

router.get('/:leaveType/:fromDate/:toDate/:officeId?/:employeeId?/:substituteId?/:remarks?', getLeavesByType);

module.exports = router
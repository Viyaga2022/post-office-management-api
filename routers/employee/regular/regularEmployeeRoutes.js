const express = require('express')
const router = express()

const { createRegularEmployee, uploadRegularEmployeesToDB, getAllRegularEmployees, getRegularEmployeeById, updateRegularEmployee, deleteRegularEmployee, getAllOffices, getEmployeeNameByOfficeIdAndDesignation } = require('../../../controllers/employee/regular/regularEmployeeController');
const { protect } = require('../../../middlewares/auth/authMiddleware');

router.post('/', createRegularEmployee);

router.get('/upload/:fileName', uploadRegularEmployeesToDB);

router.get('/offices', getAllOffices)

router.get('/name/:officeId/:designation', getEmployeeNameByOfficeIdAndDesignation)

router.get('/', getAllRegularEmployees);

router.get('/:id', getRegularEmployeeById);

router.put('/:id', updateRegularEmployee);

router.delete('/:id', deleteRegularEmployee);


module.exports = router;

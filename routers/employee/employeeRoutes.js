const express = require('express')
const router = express()

const { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee, uploadEmployeesToDB } = require('../../controllers/employee/employeeController');
const { protect } = require('../../middlewares/auth/authMiddleware');

router.post('/', createEmployee);

router.get('/upload/:fileName', uploadEmployeesToDB);

router.get('/:employeeType', getAllEmployees);

router.get('/:id', getEmployeeById);

router.put('/:id', updateEmployee);

router.delete('/:id', deleteEmployee);


module.exports = router;

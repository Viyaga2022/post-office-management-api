const express = require('express')
const router = express()

const { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee } = require('../../controllers/employee/employeeController');

router.post('/', createEmployee);

router.get('/:category', getAllEmployees);

router.get('/:id', getEmployeeById);

router.put('/:id', updateEmployee);

router.delete('/:id', deleteEmployee);

module.exports = router;

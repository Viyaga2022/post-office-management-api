const express = require('express')
const router = express()

const { createSubstituteEmployee, uploadSubstituteEmployeesToDB, getAllSubstituteEmployees,
    getSubstituteEmployeeById, updateSubstituteEmployee, deleteSubstituteEmployee, getNonWorkingSubstitute,
    getSubstitutesOfficesAndHolidays } = require('../../../controllers/employee/substitute/substituteEmployeeController');
    
const { protect } = require('../../../middlewares/auth/authMiddleware');

router.post('/', createSubstituteEmployee);

router.get('/upload/:fileName', uploadSubstituteEmployeesToDB);

router.get('/non-working/:fromDate/:toDate', getNonWorkingSubstitute);

router.get('/substitutes-offices-holidays', getSubstitutesOfficesAndHolidays)

router.get('/', getAllSubstituteEmployees);

router.get('/:id', getSubstituteEmployeeById);

router.put('/:id', updateSubstituteEmployee);

router.delete('/:id', deleteSubstituteEmployee);


module.exports = router;

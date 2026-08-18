const router = require('express').Router();
const { overallReport, departmentReport, companyReport, salaryReport } = require('../controllers/reports.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/overall', authenticate, authorize('ADMIN', 'FACULTY'), overallReport);
router.get('/departments', authenticate, authorize('ADMIN', 'FACULTY'), departmentReport);
router.get('/companies', authenticate, authorize('ADMIN', 'FACULTY'), companyReport);
router.get('/salary', authenticate, authorize('ADMIN', 'FACULTY'), salaryReport);

module.exports = router;

const router = require('express').Router();
const {
  overview, departmentAnalytics, companyAnalytics, packageAnalytics, placementTrend, genderAndCourse,
} = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth');

router.get('/overview', authenticate, overview);
router.get('/departments', authenticate, departmentAnalytics);
router.get('/companies', authenticate, companyAnalytics);
router.get('/packages', authenticate, packageAnalytics);
router.get('/placements', authenticate, placementTrend);
router.get('/demographics', authenticate, genderAndCourse);

module.exports = router;

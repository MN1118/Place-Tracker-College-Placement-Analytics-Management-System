const router = require('express').Router();
const { applyToJob, myApplications, listApplications, getApplication, updateApplicationStatus } = require('../controllers/applications.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('STUDENT'), applyToJob);
router.get('/my', authenticate, authorize('STUDENT'), myApplications);
router.get('/', authenticate, authorize('ADMIN', 'COMPANY', 'FACULTY'), listApplications);
router.get('/:id', authenticate, getApplication);
router.put('/:id/status', authenticate, authorize('ADMIN', 'COMPANY'), updateApplicationStatus);

module.exports = router;

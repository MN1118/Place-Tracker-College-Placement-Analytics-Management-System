const router = require('express').Router();
const { listJobs, getJob, createJob, updateJob, deleteJob } = require('../controllers/jobs.controller');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');

router.get('/', optionalAuthenticate, listJobs);
router.get('/:id', optionalAuthenticate, getJob);
router.post('/', authenticate, authorize('ADMIN', 'COMPANY'), createJob);
router.put('/:id', authenticate, authorize('ADMIN', 'COMPANY'), updateJob);
router.delete('/:id', authenticate, authorize('ADMIN', 'COMPANY'), deleteJob);

module.exports = router;

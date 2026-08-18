const router = require('express').Router();
const { createInterview, listInterviews, updateInterview } = require('../controllers/interviews.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('ADMIN', 'COMPANY'), createInterview);
router.get('/', authenticate, listInterviews);
router.put('/:id', authenticate, authorize('ADMIN', 'COMPANY'), updateInterview);

module.exports = router;

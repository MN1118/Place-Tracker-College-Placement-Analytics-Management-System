const router = require('express').Router();
const { listPlacements, createPlacement, updatePlacement } = require('../controllers/placements.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', listPlacements);
router.post('/', authenticate, authorize('ADMIN', 'COMPANY'), createPlacement);
router.put('/:id', authenticate, authorize('ADMIN', 'COMPANY'), updatePlacement);

module.exports = router;

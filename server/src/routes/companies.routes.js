const router = require('express').Router();
const { listCompanies, getCompany, createCompany, updateCompany } = require('../controllers/companies.controller');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');

router.get('/', optionalAuthenticate, listCompanies);
router.get('/:id', getCompany);
router.post('/', authenticate, authorize('ADMIN'), createCompany);
router.put('/:id', authenticate, authorize('ADMIN', 'COMPANY'), updateCompany);

module.exports = router;

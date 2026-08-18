const router = require('express').Router();
const { listDepartments } = require('../controllers/departments.controller');

router.get('/', listDepartments);

module.exports = router;

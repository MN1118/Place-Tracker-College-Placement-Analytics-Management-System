const router = require('express').Router();
const { listStudents, getStudent, updateStudent } = require('../controllers/students.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('ADMIN', 'FACULTY', 'COMPANY'), listStudents);
router.get('/:id', authenticate, getStudent);
router.put('/:id', authenticate, authorize('ADMIN', 'FACULTY', 'STUDENT'), updateStudent);

module.exports = router;

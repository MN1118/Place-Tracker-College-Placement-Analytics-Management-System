const router = require('express').Router();
const { myNotifications, markRead, markAllRead } = require('../controllers/notifications.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, myNotifications);
router.put('/:id/read', authenticate, markRead);
router.put('/read-all', authenticate, markAllRead);

module.exports = router;

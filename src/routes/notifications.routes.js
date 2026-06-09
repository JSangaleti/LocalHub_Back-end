const { Router } = require('express');
const notificationsController = require('../controllers/notifications.controller');

const router = Router();

router.get('/', notificationsController.getAll);
router.put('/read-all', notificationsController.markAllAsRead);
router.put('/:id/read', notificationsController.markAsRead);

module.exports = router;

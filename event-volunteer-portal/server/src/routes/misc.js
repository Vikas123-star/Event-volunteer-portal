const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const dash = require('../controllers/dashboardController');
const notif = require('../controllers/notificationController');
const exp = require('../controllers/exportController');

router.get('/dashboard/stats', protect, requireRole('admin'), dash.stats);
router.get('/notifications', protect, notif.list);
router.put('/notifications/:id/read', protect, notif.markRead);
router.put('/notifications/read-all', protect, notif.markAllRead);
router.get('/export/volunteers', protect, requireRole('admin'), exp.exportVolunteers);

module.exports = router;

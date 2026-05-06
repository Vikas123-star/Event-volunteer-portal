const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const c = require('../controllers/applicationController');

router.post('/', protect, requireRole('student', 'admin'), c.apply);
router.get('/me', protect, c.myApplications);
router.delete('/:id', protect, c.cancel);
router.get('/:id/qr', protect, c.qrImage);
router.post('/check-in', protect, requireRole('admin'), c.checkIn);

module.exports = router;

const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const c = require('../controllers/eventController');
const roleC = require('../controllers/roleController');
const appC = require('../controllers/applicationController');

router.get('/', c.listEvents);
router.get('/:id', c.getEvent);

router.post('/', protect, requireRole('admin'), c.createEvent);
router.put('/:id', protect, requireRole('admin'), c.updateEvent);
router.delete('/:id', protect, requireRole('admin'), c.deleteEvent);

// Roles under event
router.get('/:eventId/roles', roleC.listRolesForEvent);
router.post('/:eventId/roles', protect, requireRole('admin'), roleC.createRole);

// Applications for event (admin)
router.get('/:eventId/applications', protect, requireRole('admin'), appC.listForEvent);

module.exports = router;

const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const c = require('../controllers/roleController');

router.put('/:id', protect, requireRole('admin'), c.updateRole);
router.delete('/:id', protect, requireRole('admin'), c.deleteRole);

module.exports = router;

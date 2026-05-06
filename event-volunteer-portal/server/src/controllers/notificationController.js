const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/error');

exports.list = asyncHandler(async (req, res) => {
  const items = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ notifications: items });
});

exports.markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
  if (!n) return res.status(404).json({ message: 'Not found' });
  n.read = true;
  await n.save();
  res.json({ notification: n });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
  res.json({ ok: true });
});

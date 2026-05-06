const Event = require('../models/Event');
const Role = require('../models/Role');
const Application = require('../models/Application');
const { asyncHandler } = require('../middleware/error');

exports.createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, bannerColor } = req.body;
  if (!title || !description || !date) {
    return res.status(400).json({ message: 'title, description and date are required' });
  }
  const event = await Event.create({
    title,
    description,
    date,
    location: location || '',
    bannerColor: bannerColor || '#7c5cff',
    createdBy: req.user._id,
  });
  res.status(201).json({ event });
});

exports.listEvents = asyncHandler(async (req, res) => {
  const { q, from, to } = req.query;
  const filter = {};
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const events = await Event.find(filter)
    .sort({ date: 1 })
    .populate('createdBy', 'name email')
    .populate('roles');
  res.json({ events });
});

exports.getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('roles');
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json({ event });
});

exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (String(event.createdBy) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const allowed = ['title', 'description', 'date', 'location', 'bannerColor'];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) event[k] = req.body[k];
  });
  await event.save();
  res.json({ event });
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (String(event.createdBy) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  await Role.deleteMany({ eventId: event._id });
  await Application.deleteMany({ eventId: event._id });
  await event.deleteOne();
  res.json({ message: 'Event deleted' });
});

const Event = require('../models/Event');
const Role = require('../models/Role');
const Application = require('../models/Application');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');

exports.stats = asyncHandler(async (req, res) => {
  const [totalEvents, totalApplications, totalVolunteers, totalStudents, roleAgg] =
    await Promise.all([
      Event.countDocuments(),
      Application.countDocuments({ status: { $in: ['confirmed', 'applied'] } }),
      Application.distinct('userId', { status: 'confirmed' }).then((arr) => arr.length),
      User.countDocuments({ role: 'student' }),
      Role.aggregate([
        {
          $group: {
            _id: null,
            filled: { $sum: '$filledSlots' },
            max: { $sum: '$maxSlots' },
          },
        },
      ]),
    ]);

  const agg = roleAgg[0] || { filled: 0, max: 0 };
  const fillPercent = agg.max === 0 ? 0 : Math.round((agg.filled / agg.max) * 100);

  // Applications per event (top 6)
  const perEvent = await Application.aggregate([
    { $match: { status: { $in: ['confirmed', 'applied', 'waitlisted'] } } },
    { $group: { _id: '$eventId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
    { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
    { $unwind: '$event' },
    { $project: { _id: 0, eventId: '$_id', title: '$event.title', count: 1 } },
  ]);

  // Most popular roles
  const popularRoles = await Application.aggregate([
    { $group: { _id: '$roleId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
    { $lookup: { from: 'roles', localField: '_id', foreignField: '_id', as: 'role' } },
    { $unwind: '$role' },
    { $project: { _id: 0, roleId: '$_id', roleName: '$role.roleName', count: 1 } },
  ]);

  const recent = await Application.find()
    .sort({ appliedAt: -1 })
    .limit(8)
    .populate('userId', 'name email')
    .populate('eventId', 'title')
    .populate('roleId', 'roleName');

  res.json({
    totals: { totalEvents, totalApplications, totalVolunteers, totalStudents, fillPercent },
    perEvent,
    popularRoles,
    recent,
  });
});

const { Parser } = require('json2csv');
const Application = require('../models/Application');
const Event = require('../models/Event');
const { asyncHandler } = require('../middleware/error');

exports.exportVolunteers = asyncHandler(async (req, res) => {
  const { eventId, roleId, status } = req.query;
  const filter = {};
  if (eventId) filter.eventId = eventId;
  if (roleId) filter.roleId = roleId;
  if (status) filter.status = status;

  const apps = await Application.find(filter)
    .populate('userId', 'name email')
    .populate('eventId', 'title date')
    .populate('roleId', 'roleName')
    .sort({ appliedAt: -1 });

  const rows = apps.map((a) => ({
    Name: a.userId?.name || '',
    Email: a.userId?.email || '',
    Event: a.eventId?.title || '',
    EventDate: a.eventId?.date ? new Date(a.eventId.date).toISOString() : '',
    Role: a.roleId?.roleName || '',
    Status: a.status,
    AppliedAt: new Date(a.appliedAt).toISOString(),
  }));

  const parser = new Parser({
    fields: ['Name', 'Email', 'Event', 'EventDate', 'Role', 'Status', 'AppliedAt'],
  });
  const csv = rows.length
    ? parser.parse(rows)
    : 'Name,Email,Event,EventDate,Role,Status,AppliedAt\n';

  let filename = 'volunteers.csv';
  if (eventId) {
    const ev = await Event.findById(eventId);
    if (ev) filename = `volunteers-${ev.title.replace(/\s+/g, '_')}.csv`;
  }
  res.header('Content-Type', 'text/csv');
  res.attachment(filename);
  res.send(csv);
});

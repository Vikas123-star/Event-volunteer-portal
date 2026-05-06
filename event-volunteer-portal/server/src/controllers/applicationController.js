const crypto = require('crypto');
const QRCode = require('qrcode');
const Application = require('../models/Application');
const Role = require('../models/Role');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/error');
const { emitRoleUpdate, emitNotification } = require('../sockets');
const { sendEmail } = require('../utils/email');

// Apply — atomic slot reservation to prevent overbooking/race conditions
exports.apply = asyncHandler(async (req, res) => {
  const { roleId } = req.body;
  if (!roleId) return res.status(400).json({ message: 'roleId required' });

  const role = await Role.findById(roleId);
  if (!role) return res.status(404).json({ message: 'Role not found' });

  // Prevent duplicate
  const existing = await Application.findOne({ userId: req.user._id, roleId });
  if (existing) {
    return res.status(409).json({
      message: 'You have already applied for this role',
      application: existing,
    });
  }

  // Atomic reservation: only increments filledSlots if still under maxSlots
  const reserved = await Role.findOneAndUpdate(
    { _id: roleId, $expr: { $lt: ['$filledSlots', '$maxSlots'] } },
    { $inc: { filledSlots: 1 } },
    { new: true }
  );

  let status = 'confirmed';
  if (!reserved) {
    // No slot — create as waitlisted
    status = 'waitlisted';
  }

  const qrToken = crypto.randomBytes(16).toString('hex');

  let application;
  try {
    application = await Application.create({
      userId: req.user._id,
      eventId: role.eventId,
      roleId: role._id,
      status,
      qrToken,
    });
  } catch (e) {
    // If creation fails AND we had reserved a slot, roll it back
    if (reserved) {
      await Role.findByIdAndUpdate(roleId, { $inc: { filledSlots: -1 } });
    }
    if (e.code === 11000) {
      return res.status(409).json({ message: 'You have already applied for this role' });
    }
    throw e;
  }

  const freshRole = reserved || role;
  emitRoleUpdate(freshRole.eventId, freshRole);

  // Notification + email (fire and forget)
  const event = await Event.findById(role.eventId);
  const title = status === 'confirmed' ? '🎉 Application Confirmed' : '⏳ Added to Waitlist';
  const message =
    status === 'confirmed'
      ? `You are confirmed for "${role.roleName}" at "${event?.title || 'event'}".`
      : `Role "${role.roleName}" at "${event?.title || 'event'}" is full. You're on the waitlist.`;

  const notif = await Notification.create({
    userId: req.user._id,
    type: status === 'confirmed' ? 'success' : 'warning',
    title,
    message,
    link: `/events/${role.eventId}`,
  });
  emitNotification(req.user._id.toString(), notif);

  sendEmail({
    to: req.user.email,
    subject: title,
    text: message,
    html: `<div style="font-family:system-ui,sans-serif"><h2>${title}</h2><p>${message}</p></div>`,
  }).catch(() => {});

  res.status(201).json({ application, role: freshRole });
});

// Cancel an application (and promote a waitlisted user if confirmed slot freed)
exports.cancel = asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) return res.status(404).json({ message: 'Application not found' });
  if (String(app.userId) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  if (app.status === 'cancelled') {
    return res.status(400).json({ message: 'Already cancelled' });
  }

  const wasConfirmed = app.status === 'confirmed';
  app.status = 'cancelled';
  await app.save();

  let promoted = null;

  if (wasConfirmed) {
    // Free up slot and try to promote oldest waitlisted for same role
    const waitlisted = await Application.findOne({
      roleId: app.roleId,
      status: 'waitlisted',
    }).sort({ appliedAt: 1 });

    if (waitlisted) {
      waitlisted.status = 'confirmed';
      await waitlisted.save();
      promoted = waitlisted;

      const role = await Role.findById(app.roleId);
      const event = await Event.findById(app.eventId);
      const notif = await Notification.create({
        userId: waitlisted.userId,
        type: 'success',
        title: '🎉 Promoted from Waitlist',
        message: `A slot opened! You are now confirmed for "${role?.roleName}" at "${event?.title}".`,
        link: `/events/${app.eventId}`,
      });
      emitNotification(waitlisted.userId.toString(), notif);

      const promotedUser = await User.findById(waitlisted.userId);
      if (promotedUser) {
        sendEmail({
          to: promotedUser.email,
          subject: notif.title,
          text: notif.message,
          html: `<p>${notif.message}</p>`,
        }).catch(() => {});
      }
    } else {
      // No one waiting — decrement filledSlots
      const role = await Role.findByIdAndUpdate(
        app.roleId,
        { $inc: { filledSlots: -1 } },
        { new: true }
      );
      if (role) emitRoleUpdate(role.eventId, role);
    }
  }

  // Re-emit latest role
  const role = await Role.findById(app.roleId);
  if (role) emitRoleUpdate(role.eventId, role);

  res.json({ application: app, promoted });
});

// Student: my applications
exports.myApplications = asyncHandler(async (req, res) => {
  const apps = await Application.find({ userId: req.user._id })
    .sort({ appliedAt: -1 })
    .populate('eventId', 'title date location bannerColor')
    .populate('roleId', 'roleName maxSlots filledSlots');
  res.json({ applications: apps });
});

// Admin: applications for an event (optionally filter role)
exports.listForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { roleId, status } = req.query;
  const filter = { eventId };
  if (roleId) filter.roleId = roleId;
  if (status) filter.status = status;
  const apps = await Application.find(filter)
    .sort({ appliedAt: -1 })
    .populate('userId', 'name email')
    .populate('roleId', 'roleName');
  res.json({ applications: apps });
});

// QR image for an application
exports.qrImage = asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id).populate('eventId roleId');
  if (!app) return res.status(404).json({ message: 'Not found' });
  if (String(app.userId) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const payload = JSON.stringify({
    a: app._id.toString(),
    t: app.qrToken,
    e: app.eventId?._id?.toString(),
  });
  const dataUrl = await QRCode.toDataURL(payload, { margin: 1, scale: 8 });
  res.json({ qr: dataUrl, application: app });
});

// Admin: check-in by QR token
exports.checkIn = asyncHandler(async (req, res) => {
  const { qrToken } = req.body;
  if (!qrToken) return res.status(400).json({ message: 'qrToken required' });
  const app = await Application.findOne({ qrToken })
    .populate('userId', 'name email')
    .populate('roleId', 'roleName')
    .populate('eventId', 'title');
  if (!app) return res.status(404).json({ message: 'Invalid QR' });
  res.json({ application: app });
});

const Role = require('../models/Role');
const Event = require('../models/Event');
const Application = require('../models/Application');
const { asyncHandler } = require('../middleware/error');
const { emitRoleUpdate } = require('../sockets');

exports.createRole = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { roleName, maxSlots, description } = req.body;
  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (!roleName || !maxSlots) {
    return res.status(400).json({ message: 'roleName and maxSlots required' });
  }
  const role = await Role.create({
    eventId,
    roleName,
    description: description || '',
    maxSlots: Number(maxSlots),
  });
  emitRoleUpdate(eventId, role);
  res.status(201).json({ role });
});

exports.listRolesForEvent = asyncHandler(async (req, res) => {
  const roles = await Role.find({ eventId: req.params.eventId });
  res.json({ roles });
});

exports.updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(404).json({ message: 'Role not found' });
  const { roleName, maxSlots, description } = req.body;
  if (roleName !== undefined) role.roleName = roleName;
  if (description !== undefined) role.description = description;
  if (maxSlots !== undefined) {
    if (Number(maxSlots) < role.filledSlots) {
      return res
        .status(400)
        .json({ message: `Cannot reduce slots below currently filled (${role.filledSlots})` });
    }
    role.maxSlots = Number(maxSlots);
  }
  await role.save();
  emitRoleUpdate(role.eventId, role);
  res.json({ role });
});

exports.deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(404).json({ message: 'Role not found' });
  await Application.deleteMany({ roleId: role._id });
  await role.deleteOne();
  res.json({ message: 'Role deleted' });
});

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true, index: true },
    status: {
      type: String,
      enum: ['applied', 'confirmed', 'waitlisted', 'cancelled'],
      default: 'applied',
      index: true,
    },
    qrToken: { type: String, default: '' },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate applications for same (user, role)
applicationSchema.index({ userId: 1, roleId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

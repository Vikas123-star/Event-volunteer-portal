const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    date: { type: Date, required: true, index: true },
    location: { type: String, trim: true, default: '' },
    bannerColor: { type: String, default: '#7c5cff' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

eventSchema.virtual('roles', {
  ref: 'Role',
  localField: '_id',
  foreignField: 'eventId',
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);

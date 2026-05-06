const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    roleName: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, default: '' },
    maxSlots: { type: Number, required: true, min: 1, max: 10000 },
    filledSlots: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

roleSchema.virtual('available').get(function () {
  return Math.max(0, this.maxSlots - this.filledSlots);
});

roleSchema.virtual('isFull').get(function () {
  return this.filledSlots >= this.maxSlots;
});

roleSchema.set('toJSON', { virtuals: true });
roleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Role', roleSchema);

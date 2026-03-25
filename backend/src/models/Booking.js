const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      enum: ['AC_REPAIR', 'FRIDGE_REPAIR', 'TV_REPAIR'],
      required: true,
    },
    customerName: { type: String, required: true },
    customerAddress: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'],
      default: 'PENDING',
      index: true,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

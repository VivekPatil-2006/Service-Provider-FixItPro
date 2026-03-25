const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const ensureSeedBookings = async (providerId) => {
  const count = await Booking.countDocuments({ providerId });
  if (count > 0) {
    return;
  }

  const now = Date.now();
  await Booking.insertMany([
    {
      providerId,
      serviceType: 'AC_REPAIR',
      customerName: 'Rahul Sharma',
      customerAddress: 'Sector 21, Noida',
      scheduledAt: new Date(now + 2 * 60 * 60 * 1000),
      amount: 600,
      status: 'PENDING',
    },
    {
      providerId,
      serviceType: 'FRIDGE_REPAIR',
      customerName: 'Priya Singh',
      customerAddress: 'Gomti Nagar, Lucknow',
      scheduledAt: new Date(now + 24 * 60 * 60 * 1000),
      amount: 850,
      status: 'ACCEPTED',
    },
  ]);
};

const listBookings = asyncHandler(async (req, res) => {
  await ensureSeedBookings(req.provider._id);

  const bookings = await Booking.find({ providerId: req.provider._id }).sort({ createdAt: -1 });
  res.json({ bookings });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['ACCEPTED', 'REJECTED', 'COMPLETED'];
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status update');
  }

  const booking = await Booking.findOne({ _id: bookingId, providerId: req.provider._id });
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  booking.status = status;
  await booking.save();

  res.json({ message: 'Booking status updated', booking });
});

module.exports = {
  listBookings,
  updateBookingStatus,
};

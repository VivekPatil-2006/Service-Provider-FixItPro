// Provider accepts a booking: set status to accepted
const acceptBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'assigned') throw new ApiError(400, 'Only assigned bookings can be accepted');
  booking.status = 'accepted';
  await booking.save();
  res.json({ message: 'Booking accepted', booking });
});
const Booking = require('../models/Booking');
require('../models/User');
require('../models/Product');
require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const toStatus = (value) => String(value || '').trim().toLowerCase();
const pendingStatuses = ['pending', 'PENDING'];

const isAssignedToProvider = (booking, providerId) =>
  booking.providerId && String(booking.providerId) === String(providerId);

const listBookings = asyncHandler(async (req, res) => {
  const providerId = req.provider._id;
  const bookings = await Booking.find({
    $or: [
      { providerId },
      { providerId: null, status: { $in: pendingStatuses } },
      { providerId: { $exists: false }, status: { $in: pendingStatuses } },
    ],
  })
    .populate('serviceId', 'name productId')
    .populate('userId', 'name mobile profileImage')
    .sort({ scheduledDate: 1, createdAt: -1 });

  res.json({ bookings });
});



// Confirm booking: set status to confirmed
const confirmBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'pending') throw new ApiError(400, 'Only pending bookings can be confirmed');
  booking.status = 'confirmed';
  await booking.save();
  res.json({ message: 'Booking confirmed', booking });
});

// Assign booking: set status to assigned and assign provider
const assignBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'confirmed') throw new ApiError(400, 'Only confirmed bookings can be assigned');
  booking.providerId = req.provider._id;
  booking.status = 'assigned';
  await booking.save();
  // Set provider availability.status to BUSY
  req.provider.availability = req.provider.availability || {};
  req.provider.availability.status = 'BUSY';
  await req.provider.save();
  res.json({ message: 'Booking assigned', booking });
});

// Start service: set in_progress, start timer if not set
const startService = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'assigned') throw new ApiError(400, 'Service can only be started after assignment');
  booking.status = 'in_progress';
  if (!booking.serviceStartTime) booking.serviceStartTime = new Date();
  await booking.save();
  res.json({ message: 'Service started', booking });
});

// Get service steps for a booking
const getServiceSteps = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId).populate('serviceId');
  if (!booking) throw new ApiError(404, 'Booking not found');
  const steps = booking.serviceId?.steps || [];
  res.json({ steps, completedSteps: booking.completedSteps });
});

// Update step progress (sequential)
const updateStepProgress = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { stepOrder } = req.body;
  const booking = await Booking.findById(bookingId).populate('serviceId');
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'in_progress') throw new ApiError(400, 'Service must be in progress');
  const steps = booking.serviceId?.steps || [];
  if (!steps.some((s) => s.order === stepOrder)) throw new ApiError(400, 'Invalid step');
  // Enforce sequential
  const expectedOrder = (booking.completedSteps[booking.completedSteps.length - 1] || 0) + 1;
  if (stepOrder !== expectedOrder) throw new ApiError(400, 'Steps must be completed in order');
  booking.completedSteps.push(stepOrder);
  await booking.save();
  res.json({ message: 'Step completed', completedSteps: booking.completedSteps });
});

// Dummy OTP logic: always use 123456
// (No OtpSession or real SMS)

// Dummy OTP logic: always use 123456
const requestOtp = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId).populate('userId');
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'in_progress') throw new ApiError(400, 'Service must be in progress');
  // No real OTP, just pretend to send 123456
  res.json({ message: 'OTP sent to customer (dummy: 123456)' });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { otp } = req.body;
  const booking = await Booking.findById(bookingId).populate('userId');
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'in_progress') throw new ApiError(400, 'Service must be in progress');
  if (otp !== '123456') {
    throw new ApiError(400, 'Invalid OTP');
  }
  booking.status = 'completed';
  booking.serviceEndTime = new Date();
  await booking.save();
  // Set provider availability.status to AVAILABLE
  const ServiceProvider = require('../models/ServiceProvider');
  await ServiceProvider.findByIdAndUpdate(
    booking.providerId,
    { $set: { 'availability.status': 'AVAILABLE' } }
  );
  res.json({ message: 'Booking completed', booking });
});


// Provider rejects a booking: set status to rejected
const rejectService = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'assigned') throw new ApiError(400, 'Only assigned bookings can be rejected');
  booking.status = 'rejected';
  await booking.save();
  res.json({ message: 'Booking rejected', booking });
});


// Cancel booking: set status to cancelled (before completion)
const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (["completed", "cancelled"].includes(booking.status)) {
    throw new ApiError(400, 'Cannot cancel a completed or already cancelled booking');
  }
  booking.status = 'cancelled';
  booking.serviceEndTime = new Date();
  await booking.save();
  // Optionally set provider available if assigned
  if (booking.providerId) {
    const ServiceProvider = require('../models/ServiceProvider');
    await ServiceProvider.findByIdAndUpdate(
      booking.providerId,
      { $set: { 'availability.status': 'AVAILABLE' } }
    );
  }
  res.json({ message: 'Booking cancelled', booking });
});

module.exports = {
  listBookings,
  confirmBooking,
  assignBooking,
  acceptBooking,
  startService,
  rejectService,
  getServiceSteps,
  updateStepProgress,
  requestOtp,
  verifyOtp,
  cancelBooking,
};


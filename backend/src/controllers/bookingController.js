const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
require('../models/User');
require('../models/Product');
require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { createNotification } = require('../services/notificationService');

const DEMO_OTP = '123456';

const toObjectId = (value) => String(value || '');

const isAssignedToProvider = (booking, providerId) =>
  booking?.providerId && toObjectId(booking.providerId) === toObjectId(providerId);

const getOrderedSteps = (booking) => {
  const serviceSteps = booking?.serviceId?.steps;
  const bookingSteps = booking?.serviceSteps;
  const processMap = booking?.serviceId?.process;

  const processSteps =
    processMap && typeof processMap === 'object' && !Array.isArray(processMap)
      ? Object.entries(processMap).map(([title, description], index) => ({
          order: index + 1,
          title: String(title || `Step ${index + 1}`),
          description: String(description || ''),
        }))
      : [];

  const rawSteps = Array.isArray(serviceSteps) && serviceSteps.length
    ? serviceSteps
    : Array.isArray(bookingSteps) && bookingSteps.length
      ? bookingSteps
      : processSteps;

  return rawSteps
    .map((step, index) => {
      if (typeof step === 'string') {
        return {
          order: index + 1,
          title: step,
          description: '',
        };
      }

      return {
        order: Number(step?.order) || index + 1,
        title: String(step?.title || `Step ${index + 1}`),
        description: String(step?.description || ''),
      };
    })
    .sort((a, b) => a.order - b.order);
};

const ensureProviderOwner = (booking, providerId) => {
  if (!isAssignedToProvider(booking, providerId)) {
    throw new ApiError(403, 'This booking is not assigned to you');
  }
};

const updateProviderStatus = async (providerId, status) => {
  if (!providerId) return;
  await ServiceProvider.findByIdAndUpdate(providerId, { $set: { 'availability.status': status } });
};

// Provider accepts a booking: set status to accepted
const acceptBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  ensureProviderOwner(booking, req.provider._id);
  if (booking.status !== 'assigned') throw new ApiError(400, 'Only assigned bookings can be accepted');
  booking.status = 'accepted';
  await booking.save();
  await updateProviderStatus(req.provider._id, 'BUSY');

  await createNotification({
    providerId: req.provider._id,
    type: 'BOOKING_UPDATED',
    title: 'Booking Accepted',
    message: `You accepted booking ${booking.bookingId || booking._id}.`,
    meta: {
      bookingId: booking.bookingId || String(booking._id),
      bookingObjectId: booking._id,
      status: booking.status,
    },
  });

  res.json({ message: 'Booking accepted', booking });
});

const listBookings = asyncHandler(async (req, res) => {
  const providerId = req.provider._id;
  const bookings = await Booking.find({
    $or: [
      { providerId },
      { providerId: null, status: 'pending' },
      { providerId: { $exists: false }, status: 'pending' },
    ],
  })
    .populate({
      path: 'serviceId',
      select: 'name productId price duration',
      populate: {
        path: 'productId',
        select: 'name slug category',
      },
    })
    .populate('productId', 'name slug category')
    .populate('userId', 'name mobile email profileImage location')
    .populate('providerId', 'name mobile email status')
    .sort({ scheduledDate: 1, createdAt: -1 });

  res.json({ bookings });
});



// Assign booking: set status to assigned and assign provider
const assignBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'pending') throw new ApiError(400, 'Only pending bookings can be assigned');
  booking.providerId = req.provider._id;
  booking.status = 'assigned';
  await booking.save();
  await updateProviderStatus(req.provider._id, 'BUSY');

  await createNotification({
    providerId: req.provider._id,
    type: 'BOOKING_ASSIGNED',
    title: 'Booking Assigned',
    message: `A new booking ${booking.bookingId || booking._id} is assigned to you.`,
    meta: {
      bookingId: booking.bookingId || String(booking._id),
      bookingObjectId: booking._id,
      status: booking.status,
    },
  });

  res.json({ message: 'Booking assigned', booking });
});

// Start service: set in_progress, start timer if not set
const startService = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  ensureProviderOwner(booking, req.provider._id);
  if (booking.status !== 'accepted') throw new ApiError(400, 'Service can only be started after acceptance');
  booking.status = 'in_progress';
  if (!booking.serviceStartTime) booking.serviceStartTime = new Date();
  await booking.save();

  await createNotification({
    providerId: req.provider._id,
    type: 'BOOKING_UPDATED',
    title: 'Service Started',
    message: `Service started for booking ${booking.bookingId || booking._id}.`,
    meta: {
      bookingId: booking.bookingId || String(booking._id),
      bookingObjectId: booking._id,
      status: booking.status,
    },
  });

  res.json({ message: 'Service started', booking });
});

// Get service steps for a booking
const getServiceSteps = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId).populate('serviceId');
  if (!booking) throw new ApiError(404, 'Booking not found');
  ensureProviderOwner(booking, req.provider._id);

  const steps = getOrderedSteps(booking);
  res.json({
    steps,
    completedSteps: booking.completedSteps || [],
    status: booking.status,
    serviceStartTime: booking.serviceStartTime || null,
  });
});

// Update step progress (sequential)
const updateStepProgress = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { stepOrder } = req.body;
  const booking = await Booking.findById(bookingId).populate('serviceId');
  if (!booking) throw new ApiError(404, 'Booking not found');
  ensureProviderOwner(booking, req.provider._id);
  if (booking.status !== 'in_progress') throw new ApiError(400, 'Service must be in progress');
  const steps = getOrderedSteps(booking);
  if (!steps.length) throw new ApiError(400, 'No service steps configured for this booking');

  const targetOrder = Number(stepOrder);
  if (!targetOrder || !steps.some((s) => s.order === targetOrder)) {
    throw new ApiError(400, 'Invalid step');
  }

  // Enforce sequential
  const expectedOrder = (booking.completedSteps[booking.completedSteps.length - 1] || 0) + 1;
  if (targetOrder !== expectedOrder) throw new ApiError(400, 'Steps must be completed in order');
  if (booking.completedSteps.includes(targetOrder)) {
    throw new ApiError(400, 'Step already completed');
  }

  booking.completedSteps.push(targetOrder);
  await booking.save();
  res.json({ message: 'Step completed', completedSteps: booking.completedSteps, totalSteps: steps.length });
});

// Dummy OTP logic: always use 123456
// (No OtpSession or real SMS)

// Dummy OTP logic: always use 123456
const requestOtp = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId).populate('userId');
  if (!booking) throw new ApiError(404, 'Booking not found');
  ensureProviderOwner(booking, req.provider._id);
  if (booking.status !== 'in_progress') throw new ApiError(400, 'Service must be in progress');

  const bookingWithSteps = await Booking.findById(bookingId).populate('serviceId');
  const steps = getOrderedSteps(bookingWithSteps);
  if (!steps.length) throw new ApiError(400, 'No service steps configured for this booking');
  if ((booking.completedSteps || []).length !== steps.length) {
    throw new ApiError(400, 'Complete all service steps before sending OTP');
  }

  booking.status = 'otp_sent';
  booking.demoOtp = DEMO_OTP;
  booking.otpRequestedAt = new Date();
  await booking.save();

  await createNotification({
    providerId: req.provider._id,
    type: 'BOOKING_UPDATED',
    title: 'OTP Sent',
    message: `Completion OTP sent for booking ${booking.bookingId || booking._id}.`,
    meta: {
      bookingId: booking.bookingId || String(booking._id),
      bookingObjectId: booking._id,
      status: booking.status,
    },
  });

  // No real SMS in demo mode; return OTP for local testing.
  res.json({ message: 'OTP sent to customer (demo mode)', otp: DEMO_OTP, booking });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { otp } = req.body;
  const booking = await Booking.findById(bookingId).populate('userId');
  if (!booking) throw new ApiError(404, 'Booking not found');
  ensureProviderOwner(booking, req.provider._id);
  if (booking.status !== 'otp_sent') throw new ApiError(400, 'OTP must be sent before verification');
  if (String(otp || '').trim() !== String(booking.demoOtp || DEMO_OTP)) {
    throw new ApiError(400, 'Invalid OTP');
  }

  booking.status = 'completed';
  booking.serviceEndTime = new Date();
  booking.demoOtp = null;
  booking.otpRequestedAt = null;
  await booking.save();

  await updateProviderStatus(booking.providerId, 'AVAILABLE');

  await createNotification({
    providerId: req.provider._id,
    type: 'BOOKING_UPDATED',
    title: 'Booking Completed',
    message: `Booking ${booking.bookingId || booking._id} marked as completed.`,
    meta: {
      bookingId: booking.bookingId || String(booking._id),
      bookingObjectId: booking._id,
      status: booking.status,
    },
  });

  res.json({ message: 'Booking completed', booking });
});


// Provider rejects a booking: set status to rejected
const rejectService = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  ensureProviderOwner(booking, req.provider._id);
  if (booking.status !== 'assigned') throw new ApiError(400, 'Only assigned bookings can be rejected');
  booking.status = 'rejected';
  await booking.save();
  await updateProviderStatus(booking.providerId, 'AVAILABLE');

  await createNotification({
    providerId: req.provider._id,
    type: 'BOOKING_UPDATED',
    title: 'Booking Rejected',
    message: `You rejected booking ${booking.bookingId || booking._id}.`,
    meta: {
      bookingId: booking.bookingId || String(booking._id),
      bookingObjectId: booking._id,
      status: booking.status,
    },
  });

  res.json({ message: 'Booking rejected', booking });
});


// Cancel booking: set status to cancelled (before completion)
const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  ensureProviderOwner(booking, req.provider._id);
  if (["completed", "cancelled"].includes(booking.status)) {
    throw new ApiError(400, 'Cannot cancel a completed or already cancelled booking');
  }
  booking.status = 'cancelled';
  booking.serviceEndTime = new Date();
  await booking.save();

  await updateProviderStatus(booking.providerId, 'AVAILABLE');

  await createNotification({
    providerId: req.provider._id,
    type: 'BOOKING_UPDATED',
    title: 'Booking Cancelled',
    message: `Booking ${booking.bookingId || booking._id} has been cancelled.`,
    meta: {
      bookingId: booking.bookingId || String(booking._id),
      bookingObjectId: booking._id,
      status: booking.status,
    },
  });

  res.json({ message: 'Booking cancelled', booking });
});

module.exports = {
  listBookings,
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


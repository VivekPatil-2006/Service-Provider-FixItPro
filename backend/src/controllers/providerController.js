const ServiceProvider = require('../models/ServiceProvider');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { uploadImageToCloudinary } = require('../services/cloudinaryService');
const { reverseGeocode } = require('../services/geocodingService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const normalizeNumberString = (value) => String(value || '').trim();
const AADHAR_FORMAT_REGEX = /^\d{4}-\d{4}-\d{4}$/;
const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const ACCOUNT_NUMBER_REGEX = /^\d{9,18}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const getMyProfile = asyncHandler(async (req, res) => {
  res.json({ provider: req.provider });
});

const saveBasicDetails = asyncHandler(async (req, res) => {
  const { name, email, dob, gender } = req.body;

  if (!name || !email || !dob || !gender) {
    throw new ApiError(400, 'All basic detail fields are required');
  }

  if (!EMAIL_REGEX.test(String(email).trim())) {
    throw new ApiError(400, 'Please enter a valid email address');
  }

  req.provider.name = name.trim();
  req.provider.email = email.trim().toLowerCase();
  req.provider.dob = new Date(dob);
  req.provider.gender = gender;

  await req.provider.save();

  res.json({ message: 'Basic details saved', provider: req.provider });
});

const saveProfessionalDetails = asyncHandler(async (req, res) => {
  const {
    expertise,
    experience,
    maritalStatus,
    emergencyContact,
    referralName,
    hasVehicle,
    vehicleDetails,
  } = req.body;

  if (!Array.isArray(expertise) || expertise.length === 0) {
    throw new ApiError(400, 'At least one expertise is required');
  }

  if (!experience || !maritalStatus || !emergencyContact || !referralName) {
    throw new ApiError(400, 'Experience, marital status, emergency contact and referral name are required');
  }

  const normalizedEmergency = normalizeNumberString(emergencyContact);
  if (!PHONE_REGEX.test(normalizedEmergency)) {
    throw new ApiError(400, 'Please enter a valid emergency contact number');
  }

  const isVehicleOwner = Boolean(hasVehicle);
  let normalizedVehicleDetails = {
    type: '',
    model: '',
    registrationNumber: '',
  };

  if (isVehicleOwner) {
    const vType = String(vehicleDetails?.type || '').trim();
    const vModel = String(vehicleDetails?.model || '').trim();
    const vReg = String(vehicleDetails?.registrationNumber || '').trim().toUpperCase();

    if (!vType || !vModel || !vReg) {
      throw new ApiError(400, 'Vehicle type, model and registration number are required');
    }

    normalizedVehicleDetails = {
      type: vType,
      model: vModel,
      registrationNumber: vReg,
    };
  }

  req.provider.expertise = expertise;
  req.provider.experience = experience;
  req.provider.maritalStatus = maritalStatus;
  req.provider.emergencyContact = normalizedEmergency;
  req.provider.referralName = String(referralName || '').trim();
  req.provider.hasVehicle = isVehicleOwner;
  req.provider.vehicleDetails = normalizedVehicleDetails;

  await req.provider.save();

  res.json({ message: 'Professional details saved', provider: req.provider });
});

const saveDocumentDetails = asyncHandler(async (req, res) => {
  const {
    aadharNumber,
    panNumber,
    accountHolderName,
    bankName,
    accountNumber,
    ifscCode,
    branchName,
  } = req.body;

  if (
    !aadharNumber ||
    !panNumber ||
    !accountHolderName ||
    !bankName ||
    !accountNumber ||
    !ifscCode ||
    !branchName
  ) {
    throw new ApiError(400, 'Aadhaar, PAN and all bank details are required');
  }

  const normalizedAadhar = String(aadharNumber).trim();
  const normalizedPan = String(panNumber).trim().toUpperCase();
  const normalizedAccountNumber = normalizeNumberString(accountNumber);
  const normalizedIfsc = String(ifscCode).trim().toUpperCase();

  if (!AADHAR_FORMAT_REGEX.test(normalizedAadhar)) {
    throw new ApiError(400, 'Aadhaar format must be XXXX-XXXX-XXXX');
  }

  if (!PAN_REGEX.test(normalizedPan)) {
    throw new ApiError(400, 'Invalid PAN format');
  }

  if (!ACCOUNT_NUMBER_REGEX.test(normalizedAccountNumber)) {
    throw new ApiError(400, 'Invalid bank account number');
  }

  if (!IFSC_REGEX.test(normalizedIfsc)) {
    throw new ApiError(400, 'Invalid IFSC code');
  }

  const files = req.files || {};
  const hasAadharFront = files.aadharFront?.[0] || req.provider.documents?.aadharFrontUrl;
  const hasAadharBack = files.aadharBack?.[0] || req.provider.documents?.aadharBackUrl;
  const hasPanImage = files.panImage?.[0] || req.provider.documents?.panUrl;

  if (!hasAadharFront || !hasAadharBack || !hasPanImage) {
    throw new ApiError(400, 'Aadhaar front, Aadhaar back and PAN image are required');
  }

  const docUpdates = {
    aadharNumber: normalizedAadhar,
    panNumber: normalizedPan,
  };

  const uploadTasks = [
    { field: 'aadharFront', key: 'aadharFrontUrl' },
    { field: 'aadharBack', key: 'aadharBackUrl' },
    { field: 'panImage', key: 'panUrl' },
  ];

  for (const item of uploadTasks) {
    const file = files[item.field]?.[0];
    if (file) {
      const imageUrl = await uploadImageToCloudinary(
        file.buffer,
        `fixitpro/providers/${req.provider._id}/documents`
      );
      docUpdates[item.key] = imageUrl;
    }
  }

  req.provider.documents = {
    ...req.provider.documents,
    ...docUpdates,
  };

  req.provider.bankDetails = {
    accountHolderName: String(accountHolderName).trim(),
    bankName: String(bankName).trim(),
    accountNumber: normalizedAccountNumber,
    ifscCode: normalizedIfsc,
    branchName: String(branchName).trim(),
  };

  await req.provider.save();

  res.json({ message: 'Document details saved', provider: req.provider });
});

const saveLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    throw new ApiError(400, 'Latitude and longitude are required');
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new ApiError(400, 'Latitude and longitude must be valid numbers');
  }

  req.provider.location = {
    latitude: lat,
    longitude: lng,
  };

  // Mandatory flow: after submission provider is inactive until admin verifies.
  req.provider.onboardingCompleted = true;
  req.provider.status = 'INACTIVE';

  await req.provider.save();

  const address = await reverseGeocode(lat, lng);

  res.json({
    message: 'Location saved and onboarding submitted',
    provider: req.provider,
    address,
  });
});

const listServices = asyncHandler(async (_req, res) => {
  const services = await Service.find({})
    .select('productId name img video price duration steps process note ratings description')
    .populate('productId', 'name slug category description image img tags isActive')
    .sort({ name: 1 });
  res.json({ services });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name',
    'email',
    'dob',
    'gender',
    'experience',
    'maritalStatus',
    'emergencyContact',
    'referralName',
    'hasVehicle',
  ];

  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      req.provider[key] = req.body[key];
    }
  }

  await req.provider.save();

  res.json({ message: 'Profile updated', provider: req.provider });
});

const updateSkills = asyncHandler(async (req, res) => {
  const { skills, expertise } = req.body;

  if (!Array.isArray(skills)) {
    throw new ApiError(400, 'Skills must be an array');
  }

  req.provider.skills = skills.map((skill) => String(skill).trim()).filter(Boolean);

  if (Array.isArray(expertise)) {
    req.provider.expertise = expertise;
  }

  await req.provider.save();

  res.json({ message: 'Skills updated', provider: req.provider });
});

const updateAvailability = asyncHandler(async (req, res) => {
  const { workingDays, slots } = req.body;

  if (!Array.isArray(workingDays) || !Array.isArray(slots)) {
    throw new ApiError(400, 'Working days and slots must be arrays');
  }

  req.provider.availability = {
    workingDays,
    slots,
  };

  await req.provider.save();

  res.json({ message: 'Availability updated', provider: req.provider });
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const providerId = req.provider._id;

  const [totalBookings, completedBookings, pendingBookings, earningsResult] = await Promise.all([
    Booking.countDocuments({ providerId }),
    Booking.countDocuments({ providerId, status: 'completed' }),
    Booking.countDocuments({ providerId, status: 'pending' }),
    Booking.aggregate([
      { $match: { providerId: req.provider._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const totalEarnings = earningsResult[0]?.total || 0;

  res.json({
    summary: {
      totalBookings,
      completedBookings,
      pendingBookings,
      totalEarnings,
      status: req.provider.status,
    },
  });
});

const getLocationAddress = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    throw new ApiError(400, 'Latitude and longitude are required');
  }

  const address = await reverseGeocode(parseFloat(latitude), parseFloat(longitude));
  res.json({ address });
});

// ============= EARNINGS DASHBOARD ENDPOINTS =============

const getEarningsOverview = asyncHandler(async (req, res) => {
  const providerId = req.provider._id;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay()); // Start from Sunday

  const [
    totalEarnings,
    thisMonthEarnings,
    thisWeekEarnings,
    todayEarnings,
    totalCompleted,
    totalCancelled,
    totalRejected,
    pendingBookings,
  ] = await Promise.all([
    // Total earnings
    Booking.aggregate([
      { $match: { providerId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // This month earnings
    Booking.aggregate([
      { $match: { providerId, status: 'completed', createdAt: { $gte: thisMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // This week earnings
    Booking.aggregate([
      { $match: { providerId, status: 'completed', createdAt: { $gte: thisWeekStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // Today earnings
    Booking.aggregate([
      {
        $match: {
          providerId,
          status: 'completed',
          createdAt: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // Total completed
    Booking.countDocuments({ providerId, status: 'completed' }),
    // Total cancelled
    Booking.countDocuments({ providerId, status: 'cancelled' }),
    // Total rejected
    Booking.countDocuments({ providerId, status: 'rejected' }),
    // Pending bookings
    Booking.countDocuments({ providerId, status: 'pending' }),
  ]);

  res.json({
    earnings: {
      total: totalEarnings[0]?.total || 0,
      thisMonth: thisMonthEarnings[0]?.total || 0,
      thisWeek: thisWeekEarnings[0]?.total || 0,
      today: todayEarnings[0]?.total || 0,
    },
    bookingStats: {
      completed: totalCompleted,
      cancelled: totalCancelled,
      rejected: totalRejected,
      pending: pendingBookings,
    },
  });
});

const getEarningsTrend = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query; // month, week, quarter
  const providerId = req.provider._id;
  const now = new Date();

  let startDate;
  let groupFormat;

  if (period === 'week') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    groupFormat = '%Y-%m-%d';
  } else if (period === 'quarter') {
    startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 2);
    groupFormat = '%Y-%m-%d';
  } else {
    // month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    groupFormat = '%Y-%m-%d';
  }

  const trend = await Booking.aggregate([
    { $match: { providerId, status: 'completed', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        earnings: { $sum: '$amount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: '$_id',
        earnings: 1,
        bookings: 1,
        _id: 0,
      },
    },
  ]);

  res.json({ trend });
});

const getRevenueByService = asyncHandler(async (req, res) => {
  const providerId = req.provider._id;

  const serviceRevenue = await Booking.aggregate([
    { $match: { providerId, status: 'completed' } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: 'services',
        localField: 'serviceId',
        foreignField: '_id',
        as: 'serviceData',
      },
    },
    { $unwind: { path: '$serviceData', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$serviceData.name',
        totalRevenue: { $sum: '$amount' },
        bookings: { $sum: 1 },
        avgRating: { $avg: '$rating.stars' },
      },
    },
    { $sort: { totalRevenue: -1 } },
    {
      $project: {
        service: '$_id',
        totalRevenue: 1,
        bookings: 1,
        avgRating: { $cond: [{ $eq: ['$avgRating', null] }, 0, '$avgRating'] },
        _id: 0,
      },
    },
  ]);

  res.json({ serviceRevenue });
});

const getRevenueByLocation = asyncHandler(async (req, res) => {
  const providerId = req.provider._id;

  const locationRevenue = await Booking.aggregate([
    { $match: { providerId, status: 'completed' } },
    {
      $group: {
        _id: '$address.city',
        totalRevenue: { $sum: '$amount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
    {
      $project: {
        location: { $cond: [{ $eq: ['$_id', null] }, 'Unknown', '$_id'] },
        totalRevenue: 1,
        bookings: 1,
        _id: 0,
      },
    },
  ]);

  res.json({ locationRevenue });
});

const getTransactionHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const providerId = req.provider._id;

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Booking.find({ providerId, status: 'completed' })
      .select('bookingId amount createdAt payment serviceType address rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Booking.countDocuments({ providerId, status: 'completed' }),
  ]);

  const formattedTransactions = transactions.map((booking) => ({
    id: booking.bookingId,
    bookingId: booking.bookingId,
    amount: booking.amount,
    date: booking.createdAt,
    method: booking.payment?.method || 'N/A',
    status: 'paid',
    rating: booking.rating?.stars || null,
  }));

  res.json({
    transactions: formattedTransactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

module.exports = {
  getMyProfile,
  listServices,
  saveBasicDetails,
  saveProfessionalDetails,
  saveDocumentDetails,
  saveLocation,
  updateProfile,
  updateSkills,
  updateAvailability,
  getDashboardSummary,
  getLocationAddress,
  getEarningsOverview,
  getEarningsTrend,
  getRevenueByService,
  getRevenueByLocation,
  getTransactionHistory,
};

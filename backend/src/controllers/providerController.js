const ServiceProvider = require('../models/ServiceProvider');
const Booking = require('../models/Booking');
const { uploadImageToCloudinary } = require('../services/cloudinaryService');
const { reverseGeocode } = require('../services/geocodingService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const normalizeNumberString = (value) => String(value || '').trim();

const getMyProfile = asyncHandler(async (req, res) => {
  res.json({ provider: req.provider });
});

const saveBasicDetails = asyncHandler(async (req, res) => {
  const { name, email, dob, gender } = req.body;

  if (!name || !email || !dob || !gender) {
    throw new ApiError(400, 'All basic detail fields are required');
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
  } = req.body;

  if (!Array.isArray(expertise) || expertise.length === 0) {
    throw new ApiError(400, 'At least one expertise is required');
  }

  if (!experience || !maritalStatus || !emergencyContact) {
    throw new ApiError(400, 'Experience, marital status and emergency contact are required');
  }

  req.provider.expertise = expertise;
  req.provider.experience = experience;
  req.provider.maritalStatus = maritalStatus;
  req.provider.emergencyContact = normalizeNumberString(emergencyContact);
  req.provider.referralName = String(referralName || '').trim();
  req.provider.hasVehicle = Boolean(hasVehicle);

  await req.provider.save();

  res.json({ message: 'Professional details saved', provider: req.provider });
});

const saveDocumentDetails = asyncHandler(async (req, res) => {
  const { aadharNumber, panNumber } = req.body;

  if (!aadharNumber || !panNumber) {
    throw new ApiError(400, 'Aadhaar number and PAN number are required');
  }

  const files = req.files || {};
  const docUpdates = {
    aadharNumber: String(aadharNumber).trim(),
    panNumber: String(panNumber).trim().toUpperCase(),
  };

  const uploadTasks = [
    { field: 'aadharFront', key: 'aadharFrontUrl' },
    { field: 'aadharBack', key: 'aadharBackUrl' },
    { field: 'panImage', key: 'panUrl' },
    { field: 'chequeImage', key: 'chequeUrl' },
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

  await req.provider.save();

  res.json({ message: 'Document details saved', provider: req.provider });
});

const saveLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    throw new ApiError(400, 'Latitude and longitude are required');
  }

  req.provider.location = {
    latitude: Number(latitude),
    longitude: Number(longitude),
  };

  // Mandatory flow: after submission provider is inactive until admin verifies.
  req.provider.onboardingCompleted = true;
  req.provider.status = 'INACTIVE';

  await req.provider.save();

  res.json({
    message: 'Location saved and onboarding submitted',
    provider: req.provider,
  });
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
    Booking.countDocuments({ providerId, status: 'COMPLETED' }),
    Booking.countDocuments({ providerId, status: 'PENDING' }),
    Booking.aggregate([
      { $match: { providerId: req.provider._id, status: 'COMPLETED' } },
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

module.exports = {
  getMyProfile,
  saveBasicDetails,
  saveProfessionalDetails,
  saveDocumentDetails,
  saveLocation,
  updateProfile,
  updateSkills,
  updateAvailability,
  getDashboardSummary,
  getLocationAddress,
};

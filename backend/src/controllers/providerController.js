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
  const services = await Service.find({}).select('name img price duration ratings description').sort({ name: 1 });
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
};

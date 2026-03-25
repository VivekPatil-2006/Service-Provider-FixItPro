const ServiceProvider = require('../models/ServiceProvider');
const { generateToken } = require('../services/tokenService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const mobileRegex = /^[6-9]\d{9}$/;
const DUMMY_OTP = '123456';

const sendOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || !mobileRegex.test(mobile)) {
    throw new ApiError(400, 'Valid mobile number is required');
  }

  // Dummy OTP mode for development/testing.
  console.log(`Dummy OTP for ${mobile}: ${DUMMY_OTP}`);

  res.json({
    message: 'OTP sent successfully',
    debugOtp: DUMMY_OTP,
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !mobileRegex.test(mobile)) {
    throw new ApiError(400, 'Valid mobile number is required');
  }

  if (!otp || String(otp).length !== 6) {
    throw new ApiError(400, 'Valid 6 digit OTP is required');
  }

  if (String(otp) !== DUMMY_OTP) {
    throw new ApiError(400, 'Invalid OTP');
  }

  let provider = await ServiceProvider.findOne({ mobile });
  let isNewUser = false;

  if (!provider) {
    isNewUser = true;
    provider = await ServiceProvider.create({ mobile, status: 'INACTIVE' });
  } else if (!provider.onboardingCompleted) {
    isNewUser = true;
  }

  const token = generateToken(provider);

  res.json({
    message: 'Login successful',
    token,
    isNewUser,
    provider: {
      id: provider._id,
      mobile: provider.mobile,
      name: provider.name,
      status: provider.status,
      onboardingCompleted: provider.onboardingCompleted,
    },
  });
});

module.exports = {
  sendOtp,
  verifyOtp,
};

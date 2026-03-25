const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    workingDays: {
      type: [
        {
          type: String,
          enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        },
      ],
      default: [],
    },
    slots: {
      type: [
        {
          start: { type: String, required: true },
          end: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

const serviceProviderSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    dob: { type: Date },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER', ''],
      default: '',
    },
    expertise: {
      type: [
        {
          type: String,
          enum: ['AC_REPAIR', 'FRIDGE_REPAIR', 'TV_REPAIR'],
        },
      ],
      default: [],
    },
    experience: {
      type: String,
      enum: ['MORE THAN 1 YEAR', 'SIX - TWELVE_MONTHS', 'LESS THAN 6 MONTHS', 'NO EXPERIENCE', ''],
      default: '',
    },
    maritalStatus: {
      type: String,
      enum: ['MARRIED', 'UNMARRIED', ''],
      default: '',
    },
    emergencyContact: { type: String, default: '' },
    referralName: { type: String, default: '' },
    hasVehicle: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['INACTIVE', 'ACTIVE'],
      default: 'INACTIVE',
      index: true,
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    documents: {
      aadharNumber: { type: String, default: '' },
      aadharFrontUrl: { type: String, default: '' },
      aadharBackUrl: { type: String, default: '' },
      panNumber: { type: String, default: '' },
      panUrl: { type: String, default: '' },
      chequeUrl: { type: String, default: '' },
    },
    skills: {
      type: [String],
      default: [],
    },
    availability: {
      type: availabilitySchema,
      default: () => ({ workingDays: [], slots: [] }),
    },
    onboardingCompleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const ServiceProvider = mongoose.model('ServiceProvider', serviceProviderSchema);

module.exports = ServiceProvider;

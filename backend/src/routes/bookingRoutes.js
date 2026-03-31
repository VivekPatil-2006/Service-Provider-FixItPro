const express = require('express');
const {
	listBookings,
	assignBooking,
	acceptBooking,
	startService,
	rejectService,
	getServiceSteps,
	updateStepProgress,
	requestOtp,
	verifyOtp,
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();


router.use(protect);
router.get('/', listBookings);
router.patch('/:bookingId/assign', assignBooking);
router.patch('/:bookingId/accept', acceptBooking);
router.patch('/:bookingId/start', startService);
router.patch('/:bookingId/reject', rejectService);
router.get('/:bookingId/steps', getServiceSteps);
router.patch('/:bookingId/steps', updateStepProgress);

const { cancelBooking } = require('../controllers/bookingController');

router.post('/:bookingId/request-otp', requestOtp);
router.post('/:bookingId/verify-otp', verifyOtp);
router.patch('/:bookingId/cancel', cancelBooking);

module.exports = router;

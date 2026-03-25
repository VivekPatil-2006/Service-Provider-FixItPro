const express = require('express');
const { listBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listBookings);
router.patch('/:bookingId/status', updateBookingStatus);

module.exports = router;

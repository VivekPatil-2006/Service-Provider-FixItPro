const express = require('express');
const authRoutes = require('./authRoutes');
const providerRoutes = require('./providerRoutes');
const bookingRoutes = require('./bookingRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ message: 'API is healthy' });
});

router.use('/auth', authRoutes);
router.use('/providers', providerRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;

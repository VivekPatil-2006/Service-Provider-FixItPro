const express = require('express');
const authRoutes = require('./authRoutes');
const providerRoutes = require('./providerRoutes');
const bookingRoutes = require('./bookingRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ message: 'API is healthy' });
});

router.use('/auth', authRoutes);
router.use('/providers', providerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;

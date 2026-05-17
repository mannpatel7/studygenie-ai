const express = require('express');
const router = express.Router();
const { createCheckoutSession, confirmCheckoutSession, cancelPremium } = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/confirm', protect, confirmCheckoutSession);
router.post('/cancel', protect, cancelPremium);

module.exports = router;

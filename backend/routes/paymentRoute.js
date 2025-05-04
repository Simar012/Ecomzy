const express = require('express');
const { processPayment, getPaymentStatus } = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// Route to process payment via Stripe
router.route('/payment/process').post(processPayment);

// Route to get the payment status
router.route('/payment/status/:id').get(isAuthenticatedUser, getPaymentStatus);

module.exports = router;

// const express = require('express');
// const { processPayment, paytmResponse, getPaymentStatus } = require('../controllers/paymentController');
// const { isAuthenticatedUser } = require('../middlewares/auth');

// const router = express.Router();

// router.route('/payment/process').post(processPayment);
// // router.route('/stripeapikey').get(isAuthenticatedUser, sendStripeApiKey);

// router.route('/callback').post(paytmResponse);

// router.route('/payment/status/:id').get(isAuthenticatedUser, getPaymentStatus);

// module.exports = router;
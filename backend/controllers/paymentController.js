const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const paytm = require('paytmchecksum');
// const https = require('https');
const Payment = require('../models/paymentModel');
const ErrorHandler = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');

exports.processPayment = asyncErrorHandler(async (req, res, next) => {
    const { amount, email, phoneNo } = req.body;

    try {
        // Ensure the amount is in the smallest currency unit (e.g., paise for INR)
        const amountInSmallestUnit = amount * 100; // Example: if amount = 500, it should be 50000 for INR

        // Create Payment Intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInSmallestUnit,  // Amount in smallest currency unit
            currency: 'inr', // Currency
            metadata: {
                company: 'Ecomzy',  // Example metadata
            },
        });
        await Payment.create({
            orderId: paymentIntent.id,
            txnId: paymentIntent.id,
            amount: amount,
            status: paymentIntent.status,
            currency: 'INR',
            paymentMethod: 'card',
            client_secret: paymentIntent.client_secret,
            metadata: paymentIntent.metadata,
        });
        // Return the client secret to the frontend
        res.status(200).json({
            success: true,
            client_secret: paymentIntent.client_secret, // Send this to frontend
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});


const addPayment = async (data) => {
    try {
        await Payment.create(data);
    } catch (error) {
        console.log("Payment Failed!");
    }
}

exports.getPaymentStatus = asyncErrorHandler(async (req, res, next) => {

    const payment = await Payment.findOne({ orderId: req.params.id });

    if (!payment) {
        return next(new ErrorHandler("Payment Details Not Found", 404));
    }

    const txn = {
        id: payment.txnId,
        status: payment.status,
    };

    res.status(200).json({
        success: true,
        txn,
    });
});

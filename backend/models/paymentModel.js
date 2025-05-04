const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    txnId: { type: String, required: true }, // Can be Stripe's `paymentIntent` ID
    amount: { type: Number, required: true }, // Amount paid
    status: { type: String, required: true }, // Payment status
    currency: { type: String, required: true }, // Currency (e.g., 'INR')
    paymentMethod: { type: String, required: true }, // Payment method (e.g., 'card', 'wallet')
    client_secret: { type: String }, // Stripe client secret (optional if needed)
    metadata: { type: Object }, // If you're using metadata
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);

// const mongoose = require('mongoose');

// const paymentSchema = new mongoose.Schema({
//     resultInfo: {
//         resultStatus: {
//             type: String,
//             required: true
//         },
//         resultCode: {
//             type: String,
//             required: true
//         },
//         resultMsg: {
//             type: String,
//             required: true
//         },
//     },
//     txnId: {
//         type: String,
//         required: true
//     },
//     bankTxnId: {
//         type: String,
//         required: true
//     },
//     orderId: {
//         type: String,
//         required: true
//     },
//     txnAmount: {
//         type: String,
//         required: true
//     },
//     txnType: {
//         type: String,
//         required: true
//     },
//     gatewayName: {
//         type: String,
//         required: true
//     },
//     bankName: {
//         type: String,
//         required: true
//     },
//     mid: {
//         type: String,
//         required: true
//     },
//     paymentMode: {
//         type: String,
//         required: true
//     },
//     refundAmt: {
//         type: String,
//         required: true
//     },
//     txnDate: {
//         type: String,
//         required: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// module.exports = mongoose.model("Payment", paymentSchema);
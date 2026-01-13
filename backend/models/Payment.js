import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'stripe', 'paypal', 'other'],
    required: true
  },
  paymentType: {
    type: String,
    enum: ['advance', 'full', 'remaining'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    trim: true
  },
  stripePaymentIntentId: {
    type: String,
    trim: true
  },
  paypalOrderId: {
    type: String,
    trim: true
  },
  receipt: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);

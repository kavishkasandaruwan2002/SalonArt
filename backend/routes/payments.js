import express from 'express';
import { protect } from '../middleware/auth.js';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Stripe from 'stripe';

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// @route   GET /api/payments
// @desc    Get all payments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const payments = await Payment.find(query)
      .populate('booking', 'service bookingDate bookingTime status')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payments/:id
// @desc    Get single payment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking', 'service bookingDate bookingTime')
      .populate('customer', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (req.user.role === 'customer' && payment.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/payments
// @desc    Create payment
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod, paymentType } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate payment amount
    if (paymentType === 'advance') {
      if (amount < booking.finalAmount * 0.1) {
        return res.status(400).json({ message: 'Advance payment must be at least 10% of total amount' });
      }
    } else if (paymentType === 'full') {
      if (amount !== booking.finalAmount) {
        return res.status(400).json({ message: 'Full payment amount must match booking amount' });
      }
    }

    const payment = await Payment.create({
      booking: bookingId,
      customer: req.user._id,
      amount,
      paymentMethod,
      paymentType,
      status: paymentMethod === 'cash' ? 'completed' : 'pending'
    });

    // Update booking payment status
    if (paymentType === 'full') {
      booking.paymentStatus = 'paid';
      booking.advanceAmount = amount;
    } else if (paymentType === 'advance') {
      booking.paymentStatus = 'partial';
      booking.advanceAmount = amount;
    }
    await booking.save();

    // Award loyalty points (1 point per $10)
    if (payment.status === 'completed') {
      const points = Math.floor(amount / 10);
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { loyaltyPoints: points }
      });
    }

    await payment.populate('booking', 'service bookingDate');

    res.status(201).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/payments/create-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-intent', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({ message: 'Stripe is not configured' });
    }

    const { bookingId, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId: bookingId.toString(),
        customerId: req.user._id.toString()
      }
    });

    res.json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/payments/confirm-stripe
// @desc    Confirm Stripe payment
// @access  Private
router.post('/confirm-stripe', protect, async (req, res) => {
  try {
    const { paymentIntentId, bookingId, paymentType } = req.body;

    if (!stripe) {
      return res.status(400).json({ message: 'Stripe is not configured' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const amount = paymentIntent.amount / 100;

    const payment = await Payment.create({
      booking: bookingId,
      customer: req.user._id,
      amount,
      paymentMethod: 'stripe',
      paymentType,
      status: 'completed',
      transactionId: paymentIntent.id,
      stripePaymentIntentId: paymentIntent.id
    });

    // Update booking
    if (paymentType === 'full') {
      booking.paymentStatus = 'paid';
      booking.advanceAmount = amount;
    } else if (paymentType === 'advance') {
      booking.paymentStatus = 'partial';
      booking.advanceAmount = amount;
    }
    await booking.save();

    // Award loyalty points
    const points = Math.floor(amount / 10);
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { loyaltyPoints: points }
    });

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

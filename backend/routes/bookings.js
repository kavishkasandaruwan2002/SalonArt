import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Staff from '../models/Staff.js';
import PromoCode from '../models/PromoCode.js';

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get all bookings (filtered by user role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const query = {};
    
    // Customers see only their bookings, admins/staff see all
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.bookingDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('service', 'name price duration')
      .populate('staff', 'user specialization')
      .sort({ bookingDate: -1, bookingTime: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('service', 'name price duration category')
      .populate('staff', 'user specialization');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (req.user.role === 'customer' && booking.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/bookings
// @desc    Create booking
// @access  Private
router.post('/', protect, [
  body('service').notEmpty().withMessage('Service is required'),
  body('staff').notEmpty().withMessage('Staff is required'),
  body('bookingDate').notEmpty().withMessage('Booking date is required'),
  body('bookingTime').notEmpty().withMessage('Booking time is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { service: serviceId, staff: staffId, bookingDate, bookingTime, notes, promoCode } = req.body;

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ message: 'Service not found or inactive' });
    }

    // Get staff details
    const staff = await Staff.findById(staffId);
    if (!staff || !staff.isAvailable) {
      return res.status(404).json({ message: 'Staff member not found or unavailable' });
    }

    // Check if time slot is available
    const existingBooking = await Booking.findOne({
      staff: staffId,
      bookingDate: new Date(bookingDate),
      bookingTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Calculate amounts
    let totalAmount = service.price;
    let discount = 0;
    let finalAmount = totalAmount;

    // Apply promo code if provided
    if (promoCode) {
      const promo = await PromoCode.findOne({ 
        code: promoCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (promo) {
        if (!promo.usageLimit || promo.usedCount < promo.usageLimit) {
          if (totalAmount >= promo.minPurchase) {
            if (promo.discountType === 'percentage') {
              discount = (totalAmount * promo.discountValue) / 100;
              if (promo.maxDiscount) {
                discount = Math.min(discount, promo.maxDiscount);
              }
            } else {
              discount = promo.discountValue;
            }
            finalAmount = totalAmount - discount;
          }
        }
      }
    }

    // Create booking
    const booking = await Booking.create({
      customer: req.user._id,
      service: serviceId,
      staff: staffId,
      bookingDate: new Date(bookingDate),
      bookingTime,
      duration: service.duration,
      totalAmount,
      finalAmount,
      discount,
      promoCode: promoCode ? promoCode.toUpperCase() : undefined,
      notes,
      paymentStatus: 'pending'
    });

    // Update promo code usage
    if (promoCode && promo) {
      promo.usedCount += 1;
      await promo.save();
    }

    await booking.populate('service', 'name price duration');
    await booking.populate('staff', 'user specialization');

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Admin, Staff)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Only admin and staff can update status
    if (req.user.role === 'customer') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('service staff customer');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Customers can only cancel their own bookings
    if (req.user.role === 'customer') {
      if (booking.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      // Customers can only cancel
      if (req.body.status && req.body.status !== 'cancelled') {
        return res.status(403).json({ message: 'Not authorized to change status' });
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('service staff customer');

    res.json({ success: true, booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

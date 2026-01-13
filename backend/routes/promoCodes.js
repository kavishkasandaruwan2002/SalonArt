import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import PromoCode from '../models/PromoCode.js';

const router = express.Router();

// @route   GET /api/promo-codes
// @desc    Get all active promo codes (public for validation)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (code) {
      const promo = await PromoCode.findOne({ 
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });
      
      if (!promo) {
        return res.status(404).json({ message: 'Promo code not found or expired' });
      }
      
      if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
        return res.status(400).json({ message: 'Promo code usage limit reached' });
      }
      
      return res.json({ success: true, promoCode: promo });
    }

    // Admin can see all, public sees only active
    const query = req.user && req.user.role === 'admin' ? {} : { isActive: true };
    const promoCodes = await PromoCode.find(query).sort({ createdAt: -1 });
    res.json({ success: true, promoCodes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/promo-codes
// @desc    Create promo code
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), [
  body('code').notEmpty().withMessage('Code is required'),
  body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
  body('validFrom').isISO8601().withMessage('Valid from date is required'),
  body('validUntil').isISO8601().withMessage('Valid until date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const promoData = {
      ...req.body,
      code: req.body.code.toUpperCase()
    };

    const promoCode = await PromoCode.create(promoData);
    res.status(201).json({ success: true, promoCode });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/promo-codes/:id
// @desc    Update promo code
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }

    const promoCode = await PromoCode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    res.json({ success: true, promoCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/promo-codes/:id
// @desc    Delete promo code
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }
    res.json({ success: true, message: 'Promo code deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

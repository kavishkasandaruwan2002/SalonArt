import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/staff
// @desc    Get all staff members
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isAvailable } = req.query;
    const query = {};
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

    const staff = await Staff.find(query)
      .populate('user', 'name email phone avatar')
      .select('-__v');
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/staff/:id
// @desc    Get single staff member
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('user', 'name email phone avatar');
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/staff/:id/availability
// @desc    Get staff availability for a date
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Get bookings for the date
    const Booking = (await import('../models/Booking.js')).default;
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const bookings = await Booking.find({
      staff: req.params.id,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Generate available time slots
    const workingHours = staff.workingHours;
    const slots = [];
    const [startHour, startMin] = workingHours.start.split(':').map(Number);
    const [endHour, endMin] = workingHours.end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      const isBooked = bookings.some(b => b.bookingTime === timeString);
      
      slots.push({
        time: timeString,
        available: !isBooked
      });

      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }

    res.json({ success: true, availability: slots, workingHours });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/staff
// @desc    Create staff member
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { userId, ...staffData } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if staff already exists
    const existingStaff = await Staff.findOne({ user: userId });
    if (existingStaff) {
      return res.status(400).json({ message: 'Staff member already exists for this user' });
    }

    const staff = await Staff.create({
      user: userId,
      ...staffData
    });

    await staff.populate('user', 'name email phone');
    res.status(201).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/staff/:id
// @desc    Update staff member
// @access  Private (Admin, Staff)
router.put('/:id', protect, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Staff can only update their own profile
    if (req.user.role === 'staff' && staff.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone avatar');

    res.json({ success: true, staff: updatedStaff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

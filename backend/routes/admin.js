import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import Service from '../models/Service.js';
import Staff from '../models/Staff.js';

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Total revenue
    const payments = await Payment.find({
      status: 'completed',
      createdAt: { $gte: startDate }
    });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Total expenses
    const expenses = await Expense.find({
      date: { $gte: startDate }
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Bookings statistics
    const totalBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate }
    });
    const confirmedBookings = await Booking.countDocuments({
      status: 'confirmed',
      createdAt: { $gte: startDate }
    });
    const completedBookings = await Booking.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate }
    });

    // Service-wise earnings
    const serviceEarnings = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: 'booking',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $lookup: {
          from: 'services',
          localField: 'booking.service',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      {
        $group: {
          _id: '$service._id',
          serviceName: { $first: '$service.name' },
          totalEarnings: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalEarnings: -1 } }
    ]);

    // Staff-wise earnings
    const staffEarnings = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: 'booking',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $lookup: {
          from: 'staff',
          localField: 'booking.staff',
          foreignField: '_id',
          as: 'staff'
        }
      },
      { $unwind: '$staff' },
      {
        $lookup: {
          from: 'users',
          localField: 'staff.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$staff._id',
          staffName: { $first: '$user.name' },
          totalEarnings: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalEarnings: -1 } }
    ]);

    // Daily revenue for chart
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        totalBookings,
        confirmedBookings,
        completedBookings,
        serviceEarnings,
        staffEarnings,
        dailyRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings for admin
// @access  Private (Admin)
router.get('/bookings', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const query = {};

    if (status) query.status = status;
    if (startDate && endDate) {
      query.bookingDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('service', 'name price')
      .populate('staff', 'user')
      .sort({ bookingDate: -1, bookingTime: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

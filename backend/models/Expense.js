import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide expense title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Equipment', 'Marketing', 'Maintenance', 'Other'],
    default: 'Other'
  },
  amount: {
    type: Number,
    required: [true, 'Please provide expense amount'],
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receipt: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Expense', expenseSchema);

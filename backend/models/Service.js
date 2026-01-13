import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Haircut', 'Hair Color', 'Hair Treatment', 'Styling', 'Facial', 'Massage', 'Manicure', 'Pedicure', 'Other'],
    default: 'Other'
  },
  duration: {
    type: Number,
    required: [true, 'Please provide service duration in minutes'],
    min: 15
  },
  price: {
    type: Number,
    required: [true, 'Please provide service price'],
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  staffMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }]
}, {
  timestamps: true
});

export default mongoose.model('Service', serviceSchema);

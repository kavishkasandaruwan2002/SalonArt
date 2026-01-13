# Salon Business Management System

A modern, full-stack salon booking and management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Tailwind CSS.

## Features

### 🎨 Frontend Features
- **Modern UI/UX**: Fully responsive, mobile-first design with smooth animations
- **Dark Mode**: Light & dark theme support
- **Pages**: Home, Services, Booking, Login/Register, Payment, Customer Dashboard, Admin Dashboard
- **Real-time Booking**: Interactive date & time selection with availability checking
- **Payment Integration**: Stripe-ready payment system with advance/full payment options

### 🔧 Backend Features
- **RESTful API**: Clean, scalable API architecture
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin, Staff, and Customer roles
- **Booking Management**: Complete booking lifecycle management
- **Payment Processing**: Stripe integration ready
- **Analytics**: Revenue, expenses, and booking analytics
- **Loyalty Points**: Automatic points system (1 point per $10)

### 💼 Business Management
- **Admin Dashboard**: Comprehensive analytics and management
- **Revenue Tracking**: Daily, monthly, yearly reports
- **Service & Staff Analytics**: Earnings breakdown by service and staff
- **Expense Management**: Track and manage business expenses
- **Booking Management**: Approve, reschedule, cancel bookings

### 🚀 Future-Ready Features
- Email/WhatsApp notifications (infrastructure ready)
- Promo code system (implemented)
- Loyalty points system (implemented)
- SEO optimization ready
- PWA support ready
- Scalable architecture for mobile app integration

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Stripe.js
- Framer Motion
- Recharts
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT
- Bcrypt
- Stripe
- Nodemailer (ready)
- Twilio (ready)

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/salon_db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, for Stripe):
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Project Structure

```
salon/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   └── App.jsx      # Main app component
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### Staff
- `GET /api/staff` - Get all staff
- `GET /api/staff/:id` - Get single staff
- `GET /api/staff/:id/availability` - Get staff availability
- `POST /api/staff` - Create staff (Admin)

### Bookings
- `GET /api/bookings` - Get bookings (filtered by role)
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/status` - Update booking status (Admin/Staff)
- `PUT /api/bookings/:id` - Update booking

### Payments
- `GET /api/payments` - Get payments
- `GET /api/payments/:id` - Get single payment
- `POST /api/payments` - Create payment
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm-stripe` - Confirm Stripe payment

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/bookings` - Get all bookings

### Expenses
- `GET /api/expenses` - Get expenses (Admin)
- `POST /api/expenses` - Create expense (Admin)
- `PUT /api/expenses/:id` - Update expense (Admin)
- `DELETE /api/expenses/:id` - Delete expense (Admin)

## Usage

### Creating an Admin User

You can create an admin user by registering through the frontend and then updating the user role in MongoDB:

```javascript
// In MongoDB shell or using a script
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Setting Up Staff

1. Create a user account for the staff member
2. Go to Admin Dashboard
3. Create staff profile linked to the user account

### Booking Flow

1. Customer selects a service
2. Customer selects a staff member
3. Customer selects date & time (availability checked)
4. Customer can apply promo code
5. Customer reviews and confirms booking
6. Customer makes payment (advance or full)
7. Admin/Staff can manage booking status

## Payment Integration

### Stripe Setup

1. Get your Stripe API keys from [Stripe Dashboard](https://dashboard.stripe.com)
2. Add `STRIPE_SECRET_KEY` to backend `.env`
3. Add `VITE_STRIPE_PUBLISHABLE_KEY` to frontend `.env`
4. The payment system is ready to use!

### Cash Payments

Cash payments can be recorded directly through the payment page without Stripe configuration.

## Future Enhancements

- [ ] Email notifications (Nodemailer configured)
- [ ] WhatsApp notifications (Twilio configured)
- [ ] SMS notifications
- [ ] Calendar integration
- [ ] Multi-location support
- [ ] Staff scheduling system
- [ ] Inventory management
- [ ] Customer reviews and ratings
- [ ] Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email info@salon.com or create an issue in the repository.

---

Built with ❤️ using the MERN stack

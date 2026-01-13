# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB running (local or Atlas)
- npm or yarn

## Step 1: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

Backend runs on: `http://localhost:5000`

## Step 2: Frontend Setup

```bash
cd frontend
npm install
# Optional: Create .env file for Stripe
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Step 3: Create Admin User

1. Register a user through the frontend
2. Update the user role in MongoDB:

```javascript
// In MongoDB shell
use salon_db
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Step 4: Add Sample Data

### Create Services (via API or Admin Panel)

```bash
# Example: Create a service
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Haircut",
    "description": "Professional haircut",
    "category": "Haircut",
    "duration": 30,
    "price": 25
  }'
```

### Create Staff Member

1. Register a user for staff
2. Create staff profile via Admin Dashboard or API

## Step 5: Start Booking!

1. Visit `http://localhost:5173`
2. Register/Login as customer
3. Book an appointment
4. Make payment

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/salon_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env) - Optional
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For Atlas: Use connection string with credentials

### CORS Error
- Check FRONTEND_URL in backend .env
- Ensure frontend URL matches exactly

### Stripe Payment Not Working
- Add Stripe keys to both backend and frontend .env
- Use test keys for development
- Cash payment option works without Stripe

## Next Steps

1. Configure email notifications (Nodemailer)
2. Set up WhatsApp notifications (Twilio)
3. Add your business branding
4. Customize services and pricing
5. Add staff members
6. Start accepting bookings!

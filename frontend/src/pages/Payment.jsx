import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

const PaymentForm = ({ booking, onSuccess }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [paymentType, setPaymentType] = useState('full')
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    if (paymentType && booking) {
      const amount = paymentType === 'full' ? booking.finalAmount : booking.finalAmount * 0.3
      createPaymentIntent(amount)
    }
  }, [paymentType, booking])

  const createPaymentIntent = async (amount) => {
    try {
      const response = await axios.post('/payments/create-intent', {
        bookingId: booking._id,
        amount
      })
      setClientSecret(response.data.clientSecret)
    } catch (error) {
      toast.error('Failed to initialize payment')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)

    try {
      const cardElement = elements.getElement(CardElement)
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (error) {
        toast.error(error.message)
      } else if (paymentIntent.status === 'succeeded') {
        await axios.post('/payments/confirm-stripe', {
          paymentIntentId: paymentIntent.id,
          bookingId: booking._id,
          paymentType
        })
        toast.success('Payment successful!')
        onSuccess()
      }
    } catch (error) {
      toast.error('Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Payment Type</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="full"
              checked={paymentType === 'full'}
              onChange={(e) => setPaymentType(e.target.value)}
              className="mr-2"
            />
            Full Payment (${booking.finalAmount.toFixed(2)})
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="advance"
              checked={paymentType === 'advance'}
              onChange={(e) => setPaymentType(e.target.value)}
              className="mr-2"
            />
            Advance Payment (${(booking.finalAmount * 0.3).toFixed(2)} - 30%)
          </label>
        </div>
      </div>

      {clientSecret && (
        <div>
          <label className="block text-sm font-medium mb-2">Card Details</label>
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            <CardElement options={cardElementOptions} />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        className="btn-primary w-full"
      >
        {loading ? 'Processing...' : `Pay $${paymentType === 'full' ? booking.finalAmount.toFixed(2) : (booking.finalAmount * 0.3).toFixed(2)}`}
      </button>
    </form>
  )
}

const Payment = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('stripe')

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`/bookings/${bookingId}`)
      setBooking(response.data.booking)
    } catch (error) {
      toast.error('Failed to load booking')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleCashPayment = async () => {
    try {
      const amount = booking.finalAmount
      await axios.post('/payments', {
        bookingId: booking._id,
        amount,
        paymentMethod: 'cash',
        paymentType: 'full'
      })
      toast.success('Payment recorded!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to record payment')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!booking) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Complete Payment</h1>

      <div className="card mb-6">
        <h2 className="text-2xl font-semibold mb-4">Booking Summary</h2>
        <div className="space-y-2">
          <p><span className="font-semibold">Service:</span> {booking.service?.name}</p>
          <p><span className="font-semibold">Staff:</span> {booking.staff?.user?.name}</p>
          <p><span className="font-semibold">Date:</span> {new Date(booking.bookingDate).toLocaleDateString()}</p>
          <p><span className="font-semibold">Time:</span> {booking.bookingTime}</p>
          {booking.discount > 0 && (
            <p><span className="font-semibold">Discount:</span> -${booking.discount.toFixed(2)}</p>
          )}
          <p className="text-2xl font-bold text-primary-600 mt-4">
            Total: ${booking.finalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Select Payment Method</h2>
        
        <div className="mb-6">
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              Credit/Debit Card (Stripe)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              Cash Payment (Pay at salon)
            </label>
          </div>
        </div>

        {paymentMethod === 'stripe' && import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? (
          <Elements stripe={stripePromise}>
            <PaymentForm booking={booking} onSuccess={() => navigate('/dashboard')} />
          </Elements>
        ) : paymentMethod === 'cash' ? (
          <button onClick={handleCashPayment} className="btn-primary w-full">
            Record Cash Payment
          </button>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Stripe is not configured. Please use cash payment or contact support.
          </p>
        )}
      </div>
    </div>
  )
}

export default Payment

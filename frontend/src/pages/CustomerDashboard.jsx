import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'

const CustomerDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bookings')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        axios.get('/bookings'),
        axios.get('/payments')
      ])
      setBookings(bookingsRes.data.bookings)
      setPayments(paymentsRes.data.payments)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[status] || colors.pending
  }

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return

    try {
      await axios.put(`/bookings/${bookingId}`, { status: 'cancelled' })
      toast.success('Booking cancelled')
      fetchData()
    } catch (error) {
      toast.error('Failed to cancel booking')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your bookings and payments
        </p>
        {user?.loyaltyPoints > 0 && (
          <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900 rounded-lg inline-block">
            <p className="text-primary-800 dark:text-primary-200">
              🎁 You have <span className="font-bold">{user.loyaltyPoints}</span> loyalty points!
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-4 px-4 font-medium ${
            activeTab === 'bookings'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          My Bookings
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-4 px-4 font-medium ${
            activeTab === 'payments'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Payment History
        </button>
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">My Bookings</h2>
            <button
              onClick={() => navigate('/booking')}
              className="btn-primary"
            >
              New Booking
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No bookings found.</p>
              <button onClick={() => navigate('/booking')} className="btn-primary">
                Book Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="card">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-semibold">{booking.service?.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Staff:</span> {booking.staff?.user?.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Date:</span> {format(new Date(booking.bookingDate), 'MMMM dd, yyyy')} at {booking.bookingTime}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Amount:</span> ${booking.finalAmount.toFixed(2)}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Payment:</span> {booking.paymentStatus}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 mt-4 md:mt-0">
                      {booking.paymentStatus === 'pending' && (
                        <button
                          onClick={() => navigate(`/payment/${booking._id}`)}
                          className="btn-primary"
                        >
                          Pay Now
                        </button>
                      )}
                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Payment History</h2>
          {payments.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No payments found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment._id} className="card">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {payment.booking?.service?.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Date:</span> {format(new Date(payment.createdAt), 'MMMM dd, yyyy')}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Method:</span> {payment.paymentMethod}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Type:</span> {payment.paymentType}
                      </p>
                    </div>
                    <div className="text-right mt-4 md:mt-0">
                      <p className="text-2xl font-bold text-primary-600">
                        ${payment.amount.toFixed(2)}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomerDashboard

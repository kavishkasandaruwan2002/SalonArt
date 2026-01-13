import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const Booking = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    service: '',
    staff: '',
    bookingDate: '',
    bookingTime: '',
    notes: '',
    promoCode: ''
  })

  useEffect(() => {
    if (!user) {
      toast.error('Please login to book an appointment')
      navigate('/login')
      return
    }
    fetchServices()
  }, [user, navigate])

  useEffect(() => {
    if (formData.service) {
      fetchStaff()
    }
  }, [formData.service])

  useEffect(() => {
    if (formData.staff && formData.bookingDate) {
      fetchAvailability()
    }
  }, [formData.staff, formData.bookingDate])

  const fetchServices = async () => {
    try {
      const response = await axios.get('/services?isActive=true')
      setServices(response.data.services)
    } catch (error) {
      toast.error('Failed to load services')
    }
  }

  const fetchStaff = async () => {
    try {
      const service = services.find(s => s._id === formData.service)
      if (service && service.staffMembers && service.staffMembers.length > 0) {
        const staffIds = service.staffMembers.map(s => s._id || s)
        const response = await axios.get('/staff')
        const availableStaff = response.data.staff.filter(s => 
          staffIds.includes(s._id) && s.isAvailable
        )
        setStaff(availableStaff)
      } else {
        const response = await axios.get('/staff?isAvailable=true')
        setStaff(response.data.staff)
      }
    } catch (error) {
      toast.error('Failed to load staff')
    }
  }

  const fetchAvailability = async () => {
    if (!formData.staff || !formData.bookingDate) return

    try {
      const response = await axios.get(`/staff/${formData.staff}/availability?date=${formData.bookingDate}`)
      setAvailability(response.data.availability)
    } catch (error) {
      toast.error('Failed to load availability')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/bookings', formData)
      toast.success('Booking created successfully!')
      navigate(`/payment/${response.data.booking._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const selectedService = services.find(s => s._id === formData.service)
  const selectedStaffMember = staff.find(s => s._id === formData.staff)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Book Your Appointment</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= s ? 'bg-primary-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {s}
              </div>
              {s < 4 && (
                <div className={`flex-1 h-1 mx-2 ${
                  step > s ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>Service</span>
          <span>Staff</span>
          <span>Date & Time</span>
          <span>Review</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {/* Step 1: Select Service */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Select a Service</h2>
            <div className="space-y-3">
              {services.map((service) => (
                <label
                  key={service._id}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.service === service._id
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="service"
                    value={service._id}
                    checked={formData.service === service._id}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">${service.price}</p>
                      <p className="text-sm text-gray-500">{service.duration} min</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!formData.service}
              className="btn-primary mt-6 w-full"
            >
              Next: Select Staff
            </button>
          </div>
        )}

        {/* Step 2: Select Staff */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Select a Staff Member</h2>
            <div className="space-y-3">
              {staff.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No staff available for this service.</p>
              ) : (
                staff.map((member) => (
                  <label
                    key={member._id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.staff === member._id
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="staff"
                      value={member._id}
                      checked={formData.staff === member._id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div>
                      <h3 className="font-semibold">{member.user?.name || 'Staff Member'}</h3>
                      {member.specialization && member.specialization.length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Specializes in: {member.specialization.join(', ')}
                        </p>
                      )}
                      {member.rating > 0 && (
                        <p className="text-sm text-yellow-500">⭐ {member.rating.toFixed(1)}</p>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!formData.staff}
                className="btn-primary flex-1"
              >
                Next: Select Date & Time
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Select Date & Time</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Select Date</label>
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="input-field"
                  required
                />
              </div>

              {formData.bookingDate && availability.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Time</label>
                  <div className="grid grid-cols-4 gap-2">
                    {availability.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setFormData({ ...formData, bookingTime: slot.time })}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg font-medium transition-colors ${
                          formData.bookingTime === slot.time
                            ? 'bg-primary-600 text-white'
                            : slot.available
                            ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Promo Code (Optional)</label>
                <input
                  type="text"
                  name="promoCode"
                  value={formData.promoCode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter promo code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                  placeholder="Any special requests or notes..."
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!formData.bookingDate || !formData.bookingTime}
                className="btn-primary flex-1"
              >
                Next: Review
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Review Your Booking</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2">Service</h3>
                <p>{selectedService?.name} - ${selectedService?.price}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2">Staff</h3>
                <p>{selectedStaffMember?.user?.name}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2">Date & Time</h3>
                <p>{format(new Date(formData.bookingDate), 'MMMM dd, yyyy')} at {formData.bookingTime}</p>
              </div>
              {formData.notes && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p>{formData.notes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default Booking

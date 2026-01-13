import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ServiceGrid, Service } from '@/components/ui/service-grid'

const Services = () => {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Salon service grid data with Unsplash images
  const salonServiceGrid: Service[] = [
    {
      name: "Haircut",
      imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop&q=80",
      href: "/booking?service=haircut",
    },
    {
      name: "Hair Styling",
      imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a13737?w=200&h=200&fit=crop&q=80",
      href: "/booking?service=styling",
    },
    {
      name: "Hair Color",
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop&q=80",
      href: "/booking?service=color",
    },
    {
      name: "Hair Treatment",
      imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&h=200&fit=crop&q=80",
      href: "/booking?service=treatment",
    },
    {
      name: "Facial",
      imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=200&h=200&fit=crop&q=80",
      href: "/booking?service=facial",
    },
    {
      name: "Massage",
      imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&h=200&fit=crop&q=80",
      href: "/booking?service=massage",
    },
    {
      name: "Manicure",
      imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&q=80",
      href: "/booking?service=manicure",
    },
    {
      name: "Pedicure",
      imageUrl: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=200&h=200&fit=crop&q=80",
      href: "/booking?service=pedicure",
    },
    {
      name: "Makeup",
      imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38c796f?w=200&h=200&fit=crop&q=80",
      href: "/booking?service=makeup",
    },
    {
      name: "Eyebrows",
      imageUrl: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=200&h=200&fit=crop&q=80",
      href: "/booking?service=eyebrows",
    },
  ]

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await axios.get('/services')
      setServices(response.data.services)
    } catch (error) {
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...new Set(services.map(s => s.category))]

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Service Grid Section */}
      <ServiceGrid
        title="Our Premium Services"
        subtitle="Choose from our wide range of beauty and wellness services, provided by expert professionals."
        services={salonServiceGrid}
        className="bg-gray-50 dark:bg-gray-900"
      />

      {/* Detailed Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">Service Details</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Explore detailed information about each service
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No services found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover:shadow-xl transition-shadow"
              >
                {service.image && (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{service.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-primary-600">${service.price}</p>
                    <p className="text-sm text-gray-500">{service.duration} minutes</p>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm">
                    {service.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Services

import { useEffect, useState } from 'react';
import api from '../services/api.js';

const categories = ['bridal', 'hd', 'party', 'fashion', 'engagement', 'photoshoot'];

export default function AdminPanel() {
  const [dashboard, setDashboard] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'bridal',
    featured: false
  });
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [serviceError, setServiceError] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((response) => setDashboard(response.data));
    api.get('/admin/bookings').then((response) => setBookings(response.data));
    api.get('/services').then((response) => setServices(response.data));
  }, []);

  const refreshServices = async () => {
    const response = await api.get('/services');
    setServices(response.data);
  };

  const handleServiceChange = (field, value) => {
    setServiceForm((prev) => ({ ...prev, [field]: value }));
  };

  const getServiceErrorMessage = (error) => {
    const payload = error.response?.data;
    if (!payload) return error.message || 'Unable to create service.';
    if (payload.message) return payload.message;
    if (payload.error) {
      if (Array.isArray(payload.error)) {
        return payload.error.map((err) => err.message).join(', ');
      }
      return payload.error;
    }
    return 'Unable to create service.';
  };

  const handleServiceSubmit = async (event) => {
    event.preventDefault();
    setServiceError(null);
    setServiceSubmitting(true);

    try {
      await api.post('/services', {
        ...serviceForm,
        price: Number(serviceForm.price),
        duration: Number(serviceForm.duration),
        featured: Boolean(serviceForm.featured)
      });
      setServiceForm({ name: '', description: '', price: '', duration: '', category: 'bridal', featured: false });
      await refreshServices();
    } catch (error) {
      setServiceError(getServiceErrorMessage(error));
    } finally {
      setServiceSubmitting(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Delete this service?')) return;
    await api.delete(`/services/${serviceId}`);
    setServices((prev) => prev.filter((service) => service._id !== serviceId));
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-semibold text-rose-800">Admin dashboard</h1>
          <p className="mt-2 text-gray-600">Manage bookings, customer activity, and service offerings from one place.</p>
        </div>
        <div className="rounded-[32px] border border-rose-200 bg-rose-50 p-6 shadow-glass">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Admin controls</p>
          <p className="mt-3 text-sm text-gray-600">Only admin users can access this portal and make updates to services and bookings.</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-4">
        {dashboard ? [
          { label: 'Customers', value: dashboard.totalCustomers },
          { label: 'Bookings', value: dashboard.totalBookings },
          { label: 'Confirmed', value: dashboard.confirmedBookings },
          { label: 'Revenue', value: `₹${dashboard.revenue}` }
        ].map((item) => (
          <div key={item.label} className="rounded-[32px] bg-white p-8 shadow-glass">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-700">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-rose-900">{item.value}</p>
          </div>
        )) : <div className="rounded-[32px] bg-white p-8 shadow-glass">Loading analytics...</div>}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr,0.9fr]">
        <div className="space-y-10 rounded-[40px] bg-white p-8 shadow-glass">
          <div>
            <h2 className="font-semibold text-2xl text-rose-800">Recent bookings</h2>
            <p className="mt-2 text-gray-600">Review bookings from clients with customer names, booking status, and service details.</p>
            <div className="mt-6 space-y-4">
              {bookings.length === 0 ? <p className="text-gray-500">No bookings available.</p> : bookings.slice(0, 6).map((booking) => (
                <div key={booking._id} className="grid gap-4 rounded-3xl border border-rose-100 bg-rose-50 p-5 sm:grid-cols-[1fr,1fr,0.9fr]">
                  <div>
                    <p className="font-semibold text-rose-800">{booking.service?.name}</p>
                    <p className="text-sm text-gray-600">{booking.customer?.name} · {booking.customer?.email}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(booking.date).toLocaleDateString()} · {booking.timeSlot}
                    {booking.package && <span className="block text-gray-500">Package: {booking.package}</span>}
                  </div>
                  <div className="text-right text-sm font-semibold text-rose-600">{booking.status}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-2xl text-rose-800">Service catalog</h2>
            <p className="mt-2 text-gray-600">Add, update, or remove services offered on the website.</p>
            <div className="mt-6 space-y-4">
              {services.length === 0 ? <p className="text-gray-500">No services loaded.</p> : services.map((service) => (
                <div key={service._id} className="rounded-3xl border border-rose-100 bg-rose-50 p-5 sm:grid sm:grid-cols-[1fr,0.7fr,0.6fr] sm:items-center gap-4">
                  <div>
                    <p className="font-semibold text-rose-800">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.category} · ₹{service.price} · {service.duration}m</p>
                  </div>
                  <div className="text-sm text-gray-600">Featured: {service.featured ? 'Yes' : 'No'}</div>
                  <button className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-50" onClick={() => handleDeleteService(service._id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-[40px] bg-rose-50 p-8 shadow-glass">
          <h2 className="font-semibold text-2xl text-rose-800">Add new service</h2>
          <p className="mt-2 text-gray-600">As an admin, you can publish new service options directly from the portal.</p>
          <form className="mt-6 space-y-4" onSubmit={handleServiceSubmit}>
            <label className="block text-sm text-gray-700">
              Name
              <input required value={serviceForm.name} onChange={(event) => handleServiceChange('name', event.target.value)} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-4 text-sm outline-none focus:border-rose-400" />
            </label>
            <label className="block text-sm text-gray-700">
              Description
              <textarea required minLength={10} value={serviceForm.description} onChange={(event) => handleServiceChange('description', event.target.value)} rows="4" className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-4 text-sm outline-none focus:border-rose-400" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-gray-700">
                Price
                <input required type="number" value={serviceForm.price} onChange={(event) => handleServiceChange('price', event.target.value)} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-4 text-sm outline-none focus:border-rose-400" />
              </label>
              <label className="block text-sm text-gray-700">
                Duration (mins)
                <input required type="number" value={serviceForm.duration} onChange={(event) => handleServiceChange('duration', event.target.value)} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-4 text-sm outline-none focus:border-rose-400" />
              </label>
            </div>
            <label className="block text-sm text-gray-700">
              Category
              <select value={serviceForm.category} onChange={(event) => handleServiceChange('category', event.target.value)} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-4 text-sm outline-none focus:border-rose-400">
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input type="checkbox" checked={serviceForm.featured} onChange={(event) => handleServiceChange('featured', event.target.checked)} className="h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500" />
              Mark as featured
            </label>
            {serviceError && <p className="text-sm text-rose-600">{serviceError}</p>}
            <button type="submit" disabled={serviceSubmitting} className="w-full rounded-full bg-rose-700 px-6 py-4 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60">
              {serviceSubmitting ? 'Publishing...' : 'Publish service'}
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
}

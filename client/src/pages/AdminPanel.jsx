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
  const [editingServiceId, setEditingServiceId] = useState('');
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', category: 'bridal', tags: '', featured: false });
  const [reviewModeration, setReviewModeration] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', order: 0, featured: false });
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({ customerName: '', rating: 5, comment: '', avatar: '', featured: false });
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState({ code: '', discount: 10, description: '', expiresAt: '', usageLimit: 100 });
  const [couponCampaigns, setCouponCampaigns] = useState({ totalCoupons: 0, totalRedemptions: 0, totalDiscountValue: 0, items: [] });
  const [couponCampaignLoading, setCouponCampaignLoading] = useState(false);
  const [popularPackages, setPopularPackages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/dashboard').then((response) => setDashboard(response.data));
    api.get('/admin/bookings').then((response) => setBookings(response.data));
    api.get('/services').then((response) => setServices(response.data));
    loadGalleryItems();
    loadReviewsForModeration();
    loadFaqs();
    loadTestimonials();
    loadCoupons();
    loadCouponCampaigns();
    loadPopularPackages();
    loadNotifications();
  }, []);

  const refreshServices = async () => {
    const response = await api.get('/services');
    setServices(response.data);
  };

  const loadGalleryItems = async () => {
    setGalleryLoading(true);
    const response = await api.get('/gallery');
    setGalleryItems(response.data);
    setGalleryLoading(false);
  };

  const loadReviewsForModeration = async () => {
    const response = await api.get('/reviews');
    setReviewModeration(response.data);
  };

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleImageUpload = async (serviceId, file) => {
    if (!file) return;
    if (!cloudName || !uploadPreset) return alert('Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET');
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', uploadPreset);

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    const res = await fetch(url, { method: 'POST', body: form });
    const data = await res.json();
    if (!data.secure_url) return alert('Upload failed');
    await api.post(`/services/${serviceId}/images`, { imageUrl: data.secure_url });
    await refreshServices();
  };

  const handleRemoveImage = async (serviceId, imageUrl) => {
    if (!window.confirm('Remove this image?')) return;
    await api.delete(`/services/${serviceId}/images`, { data: { imageUrl } });
    await refreshServices();
  };

  const handleGalleryChange = (field, value) => {
    setGalleryForm((prev) => ({ ...prev, [field]: value }));
  };

  const uploadGalleryFile = async (file) => {
    if (!file) return null;
    if (!cloudName || !uploadPreset) return alert('Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    const res = await fetch(url, { method: 'POST', body: formData });
    const data = await res.json();
    return data.secure_url;
  };

  const handleGallerySubmit = async (event) => {
    event.preventDefault();
    if (!galleryForm.title || !galleryForm.description) return;
    const fileInput = document.querySelector('#gallery-file-input');
    const file = fileInput?.files?.[0];
    if (!file) return alert('Please choose an image to upload.');
    const mediaUrl = await uploadGalleryFile(file);
    if (!mediaUrl) return;
    await api.post('/gallery', {
      ...galleryForm,
      mediaUrl,
      featured: galleryForm.featured
    });
    setGalleryForm({ title: '', description: '', category: 'bridal', tags: '', featured: false });
    if (fileInput) fileInput.value = '';
    await loadGalleryItems();
  };

  const handleDeleteGalleryItem = async (galleryId) => {
    if (!window.confirm('Delete this gallery item?')) return;
    await api.delete(`/gallery/${galleryId}`);
    await loadGalleryItems();
  };

  const loadFaqs = async () => {
    setFaqLoading(true);
    const response = await api.get('/faqs');
    setFaqs(response.data);
    setFaqLoading(false);
  };

  const handleFaqChange = (field, value) => {
    setFaqForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddFaq = async (event) => {
    event.preventDefault();
    if (!faqForm.question || !faqForm.answer) return alert('Question and answer required');
    await api.post('/faqs', faqForm);
    setFaqForm({ question: '', answer: '', order: 0, featured: false });
    await loadFaqs();
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm('Delete this FAQ?')) return;
    await api.delete(`/faqs/${faqId}`);
    await loadFaqs();
  };

  const loadTestimonials = async () => {
    setTestimonialsLoading(true);
    const res = await api.get('/testimonials');
    setTestimonials(res.data);
    setTestimonialsLoading(false);
  };

  const handleTestimonialChange = (field, value) => setTestimonialForm((p) => ({ ...p, [field]: value }));

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    if (!testimonialForm.comment) return alert('Comment required');
    await api.post('/testimonials', testimonialForm);
    setTestimonialForm({ customerName: '', rating: 5, comment: '', avatar: '', featured: false });
    await loadTestimonials();
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    await api.delete(`/testimonials/${id}`);
    await loadTestimonials();
  };

  const loadCoupons = async () => {
    const res = await api.get('/coupons');
    setCoupons(res.data);
  };

  const loadCouponCampaigns = async () => {
    setCouponCampaignLoading(true);
    try {
      const res = await api.get('/admin/coupons');
      setCouponCampaigns(res.data);
    } catch (e) {
      setCouponCampaigns({ totalCoupons: 0, totalRedemptions: 0, totalDiscountValue: 0, items: [] });
    } finally {
      setCouponCampaignLoading(false);
    }
  };

  const handleCouponChange = (field, value) => setCouponForm((p) => ({ ...p, [field]: value }));

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code) return alert('Code required');
    await api.post('/coupons', couponForm);
    setCouponForm({ code: '', discount: 10, description: '', expiresAt: '', usageLimit: 100 });
    await loadCoupons();
    await loadCouponCampaigns();
  };

  const handleToggleCouponActive = async (coupon) => {
    await api.put(`/coupons/${coupon._id}`, { active: !coupon.active });
    await loadCoupons();
    await loadCouponCampaigns();
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    await api.delete(`/coupons/${id}`);
    await loadCoupons();
    await loadCouponCampaigns();
  };

  const loadPopularPackages = async () => {
    try {
      const res = await api.get('/admin/popular');
      setPopularPackages(res.data.items || []);
    } catch (e) {
      setPopularPackages([]);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(res.data || []);
    } catch (e) {
      setNotifications([]);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const unreadIds = notifications.filter((notification) => !notification.read).map((notification) => notification._id);
      await Promise.all(unreadIds.map((id) => api.patch(`/admin/notifications/${id}/read`)));
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    } catch (e) {
      // ignore
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await api.patch(`/admin/notifications/${notificationId}/read`);
      setNotifications((prev) => prev.map((notification) => (
        notification._id === notificationId ? { ...notification, read: true } : notification
      )));
    } catch (e) {
      // ignore
    }
  };

  const loadSlots = async () => {
    if (!selectedServiceId || !selectedDate) return;
    setSlotsLoading(true);
    try {
      const res = await api.get(`/admin/slots`, { params: { serviceId: selectedServiceId, date: selectedDate } });
      setSlots(res.data || []);
    } catch (e) {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBlockSlot = async (timeSlot) => {
    const reason = window.prompt(`Block ${timeSlot} for ${selectedDate} - reason (optional)`,'');
    if (reason === null) return;
    await api.post('/admin/slots/block', { serviceId: selectedServiceId, date: selectedDate, timeSlot, reason });
    await loadSlots();
  };

  const handleUnblockSlot = async (blockedId) => {
    if (!window.confirm('Unblock this slot?')) return;
    await api.delete(`/admin/slots/block/${blockedId}`);
    await loadSlots();
  };

  const handleApproveReview = async (reviewId) => {
    await api.patch(`/reviews/${reviewId}/verify`);
    await loadReviewsForModeration();
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    await api.delete(`/reviews/${reviewId}`);
    await loadReviewsForModeration();
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
      if (editingServiceId) {
        const res = await api.put(`/services/${editingServiceId}`, {
          ...serviceForm,
          price: Number(serviceForm.price),
          duration: Number(serviceForm.duration),
          featured: Boolean(serviceForm.featured)
        });
        setServices((prev) => prev.map((s) => (s._id === res.data._id ? res.data : s)));
        setEditingServiceId('');
      } else {
        const res = await api.post('/services', {
          ...serviceForm,
          price: Number(serviceForm.price),
          duration: Number(serviceForm.duration),
          featured: Boolean(serviceForm.featured)
        });
        setServices((prev) => [res.data, ...prev]);
      }
      setServiceForm({ name: '', description: '', price: '', duration: '', category: 'bridal', featured: false });
      await refreshServices();
    } catch (error) {
      setServiceError(getServiceErrorMessage(error));
    } finally {
      setServiceSubmitting(false);
    }
  };

  const handleEditService = (service) => {
    setServiceForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      duration: service.duration || '',
      category: service.category || 'bridal',
      featured: Boolean(service.featured)
    });
    setEditingServiceId(service._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setServiceForm({ name: '', description: '', price: '', duration: '', category: 'bridal', featured: false });
    setEditingServiceId('');
    setServiceError(null);
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Delete this service?')) return;
    await api.delete(`/services/${serviceId}`);
    setServices((prev) => prev.filter((service) => service._id !== serviceId));
  };

  const analyticsItems = dashboard ? [
    { label: 'Customers', value: dashboard.totalCustomers },
    { label: 'Bookings', value: dashboard.totalBookings },
    { label: 'Confirmed', value: dashboard.confirmedBookings },
    { label: 'Revenue', value: `₹${dashboard.revenue}` }
  ] : null;

  const unreadNotificationsCount = notifications.filter((notification) => !notification.read).length;

  if (analyticsItems && popularPackages && popularPackages.length > 0) {
    const top = popularPackages.slice(0, 3).map((p) => `${p.label} (${p.count})`).join(', ');
    analyticsItems.push({ label: 'Top Packages', value: top });
  }

  if (analyticsItems && unreadNotificationsCount > 0) {
    analyticsItems.push({ label: 'Unread alerts', value: unreadNotificationsCount });
  }

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

      <div className="mt-8 rounded-[32px] border border-rose-200 bg-white p-6 shadow-glass">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Alerts</p>
            <div className="mt-2 flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-rose-800">Latest admin notifications</h2>
              {notifications.length > 0 && (
                <span className="rounded-full bg-rose-700 px-3 py-1 text-xs font-semibold text-white">{notifications.filter((notification) => !notification.read).length} unread</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={loadNotifications}
            className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-50"
          >
            Refresh
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-gray-500">No admin notifications yet.</p>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <div key={notification._id} className={`rounded-3xl p-4 ${notification.read ? 'bg-rose-50 border border-rose-100' : 'bg-rose-100 border border-rose-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-rose-800">{notification.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    {notification.link && <p className="mt-2 text-xs text-rose-700">Link: {notification.link}</p>}
                  </div>
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(notification._id)}
                      className="rounded-full bg-rose-700 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-800"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
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
            <h2 className="font-semibold text-2xl text-rose-800">Upcoming & recent bookings</h2>
            <p className="mt-2 text-gray-600">Bookings that are upcoming or recently completed (completed bookings move to history after 24 hours).</p>
            <div className="mt-6 space-y-4">
              {bookings.length === 0 ? <p className="text-gray-500">No bookings available.</p> : (() => {
                const now = new Date();
                const upcoming = bookings.filter((b) => !b.endedAt || new Date(b.endedAt) >= now);
                const justCompleted = bookings.filter((b) => b.endedAt && new Date(b.endedAt) < now && new Date(b.endedAt) >= new Date(now.getTime() - 24 * 60 * 60 * 1000));
                const display = upcoming.concat(justCompleted).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 6);
                return display.map((booking) => (
                  <div key={booking._id} className="grid gap-4 rounded-3xl border border-rose-100 bg-rose-50 p-5 sm:grid-cols-[1fr,1fr,0.9fr]">
                    <div>
                      <p className="font-semibold text-rose-800">{booking.service?.name}</p>
                      <p className="text-sm text-gray-600">{booking.customer?.name} · {booking.customer?.email}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(booking.date).toLocaleDateString()} · {booking.timeSlot}
                      {booking.package && <span className="block text-gray-500">Package: {booking.package}</span>}
                    </div>
                    <div className="text-right text-sm font-semibold text-rose-600">{booking.derivedStatus || booking.status}</div>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-2xl text-rose-800">Booking history</h2>
            <p className="mt-2 text-gray-600">Bookings older than 24 hours.</p>
            <div className="mt-6 space-y-4">
              {(() => {
                const now = new Date();
                const history = bookings.filter((b) => b.endedAt && new Date(b.endedAt) < new Date(now.getTime() - 24 * 60 * 60 * 1000)).sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt));
                if (history.length === 0) return <p className="text-gray-500">No history yet.</p>;
                return history.slice(0, 6).map((booking) => (
                  <div key={booking._id} className="grid gap-4 rounded-3xl border border-rose-100 bg-cream p-5 sm:grid-cols-[1fr,1fr,0.9fr]">
                    <div>
                      <p className="font-semibold text-rose-800">{booking.service?.name}</p>
                      <p className="text-sm text-gray-600">{booking.customer?.name} · {booking.customer?.email}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(booking.date).toLocaleDateString()} · {booking.timeSlot}
                      {booking.package && <span className="block text-gray-500">Package: {booking.package}</span>}
                    </div>
                    <div className="text-right text-sm font-semibold text-rose-600">{booking.derivedStatus || booking.status}</div>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-2xl text-rose-800">Service catalog</h2>
            <p className="mt-2 text-gray-600">Add, update, or remove services offered on the website.</p>
            <div className="mt-6 space-y-4">
              {services.length === 0 ? <p className="text-gray-500">No services loaded.</p> : services.map((service) => (
                <div key={service._id} className="rounded-3xl border border-rose-100 bg-rose-50 p-5 sm:grid sm:grid-cols-[1fr,0.7fr,0.6fr] sm:items-start gap-4">
                  <div>
                    <p className="font-semibold text-rose-800">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.category} · ₹{service.price} · {service.duration}m</p>
                    <div className="mt-3 flex gap-2">
                      {(service.images || []).slice(0,4).map((img) => (
                        <img key={img} src={img} alt={service.name} className="h-12 w-12 rounded-md object-cover" />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Featured: {service.featured ? 'Yes' : 'No'}</div>
                  <div className="flex flex-col items-end gap-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700">
                      Upload image
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(service._id, e.target.files[0])} />
                    </label>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditService(service)} className="rounded-full border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700">Edit</button>
                        <button className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-50" onClick={() => handleDeleteService(service._id)}>
                          Delete
                        </button>
                      </div>
                  </div>
                  <div className="col-span-3 mt-2">
                    {(service.images || []).map((img) => (
                      <div key={img} className="mt-2 flex items-center justify-between gap-4 rounded-md border border-rose-100 bg-white p-2">
                        <img src={img} alt={service.name} className="h-20 w-28 rounded-md object-cover" />
                        <div className="flex-1 text-sm text-gray-600">{img}</div>
                        <button onClick={() => handleRemoveImage(service._id, img)} className="rounded-full border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-2xl text-rose-800">Calendar & slot management</h2>
            <p className="mt-2 text-gray-600">View bookings and block/unblock time slots per service and date.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm text-gray-700">
                Service
                <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-3 text-sm outline-none">
                  <option value="">Choose service</option>
                  {services.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </label>
              <label className="block text-sm text-gray-700">
                Date
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-3 text-sm outline-none" />
              </label>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={loadSlots} className="rounded-full bg-rose-700 px-5 py-2 text-sm font-semibold text-white">Load slots</button>
            </div>

            <div className="mt-4">
              {slotsLoading ? <p className="text-gray-500">Loading slots...</p> : slots.length === 0 ? <p className="text-gray-500">No slots to show.</p> : (
                <div className="grid gap-3">
                  {slots.map((s) => (
                    <div key={s.timeSlot} className="flex items-center justify-between rounded-xl border border-rose-100 bg-white p-3">
                      <div>
                        <p className="font-semibold text-rose-800">{s.timeSlot}</p>
                        <p className="text-sm text-gray-600">{s.status}{s.status==='booked' && s.customer ? ` · ${s.customer.name || s.customer.email}` : ''}</p>
                      </div>
                      <div>
                        {s.status === 'available' && (
                          <button onClick={() => handleBlockSlot(s.timeSlot)} className="rounded-full border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700">Block</button>
                        )}
                        {s.status === 'blocked' && (
                          <button onClick={() => handleUnblockSlot(s.blockedId)} className="rounded-full border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700">Unblock</button>
                        )}
                        {s.status === 'booked' && (
                          <button disabled className="rounded-full border border-rose-200 bg-white px-3 py-2 text-sm text-gray-400">Booked</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-2xl text-rose-800">Gallery management</h2>
            <p className="mt-2 text-gray-600">Upload or remove portfolio items for the public gallery.</p>
            <form className="mt-6 space-y-4 rounded-[32px] border border-rose-100 bg-rose-50 p-6" onSubmit={handleGallerySubmit}>
              <label className="block text-sm text-gray-700">
                Title
                <input required value={galleryForm.title} onChange={(event) => handleGalleryChange('title', event.target.value)} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-4 text-sm outline-none focus:border-rose-400" />
              </label>
              <label className="block text-sm text-gray-700">
                Description
                <textarea required value={galleryForm.description} onChange={(event) => handleGalleryChange('description', event.target.value)} rows="3" className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-4 text-sm outline-none focus:border-rose-400" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-gray-700">
                  Category
                  <select value={galleryForm.category} onChange={(event) => handleGalleryChange('category', event.target.value)} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-4 text-sm outline-none focus:border-rose-400">
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-gray-700">
                  Tags (comma separated)
                  <input value={galleryForm.tags} onChange={(event) => handleGalleryChange('tags', event.target.value)} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-4 text-sm outline-none focus:border-rose-400" />
                </label>
              </div>
              <label className="block text-sm text-gray-700">
                Image file
                <input id="gallery-file-input" required type="file" accept="image/*" className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-4 text-sm text-gray-700 outline-none focus:border-rose-400" />
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input type="checkbox" checked={galleryForm.featured} onChange={(event) => handleGalleryChange('featured', event.target.checked)} className="h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500" />
                Feature this item in the gallery
              </label>
              <button type="submit" className="w-full rounded-full bg-rose-700 px-6 py-4 text-sm font-semibold text-white transition hover:bg-rose-800">Upload gallery item</button>
            </form>

            <div className="mt-8 space-y-4">
              {galleryLoading ? <p className="text-gray-500">Loading gallery items...</p> : galleryItems.length === 0 ? <p className="text-gray-500">No gallery items yet.</p> : galleryItems.slice(0, 6).map((item) => (
                <div key={item._id} className="flex flex-col gap-3 rounded-3xl border border-rose-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-rose-800">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.category} · {item.tags?.join(', ') || 'no tags'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDeleteGalleryItem(item._id)} className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

                <div>
                  <h2 className="font-semibold text-2xl text-rose-800">Testimonials</h2>
                  <p className="mt-2 text-gray-600">Manage customer testimonials shown on the homepage carousel.</p>
                  <form onSubmit={handleAddTestimonial} className="mt-6 space-y-4 rounded-[24px] border border-rose-100 bg-rose-50 p-4">
                    <label className="block text-sm text-gray-700">
                      Name
                      <input value={testimonialForm.customerName} onChange={(e) => handleTestimonialChange('customerName', e.target.value)} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-3 text-sm outline-none focus:border-rose-400" />
                    </label>
                    <label className="block text-sm text-gray-700">
                      Comment
                      <textarea value={testimonialForm.comment} onChange={(e) => handleTestimonialChange('comment', e.target.value)} rows={3} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-3 text-sm outline-none focus:border-rose-400" />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm text-gray-700">
                        Rating
                        <input type="number" min={1} max={5} value={testimonialForm.rating} onChange={(e) => handleTestimonialChange('rating', Number(e.target.value))} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-3 text-sm outline-none focus:border-rose-400" />
                      </label>
                      <label className="block text-sm text-gray-700">
                        Avatar URL
                        <input value={testimonialForm.avatar} onChange={(e) => handleTestimonialChange('avatar', e.target.value)} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-3 text-sm outline-none focus:border-rose-400" />
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-3 text-sm text-gray-700">
                        <input type="checkbox" checked={testimonialForm.featured} onChange={(e) => handleTestimonialChange('featured', e.target.checked)} className="h-4 w-4 rounded border-rose-300 text-rose-600" />
                        Feature
                      </label>
                      <button type="submit" className="rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white">Add testimonial</button>
                    </div>
                  </form>

                  <div className="mt-6 space-y-3">
                    {testimonialsLoading ? <p className="text-gray-500">Loading testimonials...</p> : testimonials.length === 0 ? <p className="text-gray-500">No testimonials yet.</p> : testimonials.map((t) => (
                      <div key={t._id} className="rounded-2xl border border-rose-100 bg-white p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-rose-800">{t.customerName || 'Guest'}</p>
                            <p className="text-sm text-gray-600 mt-1">{t.rating} ⭐ {t.featured ? '· Featured' : ''}</p>
                            <p className="mt-2 text-gray-600">{t.comment}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleDeleteTestimonial(t._id)} className="rounded-full border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-semibold text-2xl text-rose-800">FAQ management</h2>
                <p className="mt-2 text-gray-600">Create and remove frequently asked questions shown on the public FAQ page.</p>
                <form onSubmit={handleAddFaq} className="mt-6 space-y-4 rounded-[24px] border border-rose-100 bg-rose-50 p-4">
                  <label className="block text-sm text-gray-700">
                    Question
                    <input value={faqForm.question} onChange={(e) => handleFaqChange('question', e.target.value)} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-3 text-sm outline-none focus:border-rose-400" />
                  </label>
                  <label className="block text-sm text-gray-700">
                    Answer (HTML allowed)
                    <textarea value={faqForm.answer} onChange={(e) => handleFaqChange('answer', e.target.value)} rows={4} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-3 text-sm outline-none focus:border-rose-400" />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm text-gray-700">
                      Order
                      <input type="number" value={faqForm.order} onChange={(e) => handleFaqChange('order', Number(e.target.value))} className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-3 text-sm outline-none focus:border-rose-400" />
                    </label>
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input type="checkbox" checked={faqForm.featured} onChange={(e) => handleFaqChange('featured', e.target.checked)} className="h-4 w-4 rounded border-rose-300 text-rose-600" />
                      Feature on top
                    </label>
                  </div>
                  <button type="submit" className="rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white">Add FAQ</button>
                </form>

                <div className="mt-6 space-y-3">
                  {faqLoading ? <p className="text-gray-500">Loading FAQs...</p> : faqs.length === 0 ? <p className="text-gray-500">No FAQs yet.</p> : faqs.map((f) => (
                    <div key={f._id} className="rounded-2xl border border-rose-100 bg-white p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-rose-800">{f.question}</p>
                          <p className="text-sm text-gray-600 mt-1">{f.featured ? 'Featured' : ''}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleDeleteFaq(f._id)} className="rounded-full border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
        </div>

        <aside className="rounded-[40px] bg-rose-50 p-8 shadow-glass">
          <h2 className="font-semibold text-2xl text-rose-800">{editingServiceId ? 'Edit service' : 'Add new service'}</h2>
          <p className="mt-2 text-gray-600">As an admin, you can publish or update service options directly from the portal.</p>
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
            <div className="flex gap-3">
              <button type="submit" disabled={serviceSubmitting} className="flex-1 rounded-full bg-rose-700 px-6 py-4 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60">
                {serviceSubmitting ? (editingServiceId ? 'Updating...' : 'Publishing...') : (editingServiceId ? 'Update service' : 'Publish service')}
              </button>
              {editingServiceId && (
                <button type="button" onClick={handleCancelEdit} className="rounded-full border border-rose-200 bg-white px-4 py-4 text-sm text-rose-700">Cancel</button>
              )}
            </div>
          </form>
          
          <div className="mt-8">
            <h3 className="font-semibold text-lg text-rose-800">Coupons</h3>
            <p className="mt-2 text-sm text-gray-600">Create coupon codes for discounts.</p>
            <form className="mt-4 space-y-3" onSubmit={handleAddCoupon}>
              <div className="grid gap-3">
                <input placeholder="CODE" value={couponForm.code} onChange={(e) => handleCouponChange('code', e.target.value)} className="w-full rounded-2xl border border-rose-200 bg-white p-3 text-sm outline-none" />
                <input placeholder="Discount %" type="number" value={couponForm.discount} onChange={(e) => handleCouponChange('discount', Number(e.target.value))} className="w-full rounded-2xl border border-rose-200 bg-white p-3 text-sm outline-none" />
                <input placeholder="Usage limit" type="number" value={couponForm.usageLimit} onChange={(e) => handleCouponChange('usageLimit', Number(e.target.value))} className="w-full rounded-2xl border border-rose-200 bg-white p-3 text-sm outline-none" />
                <input placeholder="Expiry (YYYY-MM-DD)" value={couponForm.expiresAt} onChange={(e) => handleCouponChange('expiresAt', e.target.value)} className="w-full rounded-2xl border border-rose-200 bg-white p-3 text-sm outline-none" />
                <input placeholder="Description" value={couponForm.description} onChange={(e) => handleCouponChange('description', e.target.value)} className="w-full rounded-2xl border border-rose-200 bg-white p-3 text-sm outline-none" />
              </div>
              <button type="submit" className="w-full rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white">Create coupon</button>
            </form>

            <div className="mt-6 rounded-[32px] border border-rose-100 bg-white p-5 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-rose-50 p-4 text-center">
                  <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Campaigns</p>
                  <p className="mt-3 text-2xl font-semibold text-rose-900">{couponCampaigns.totalCoupons}</p>
                </div>
                <div className="rounded-2xl bg-rose-50 p-4 text-center">
                  <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Redemptions</p>
                  <p className="mt-3 text-2xl font-semibold text-rose-900">{couponCampaigns.totalRedemptions}</p>
                </div>
                <div className="rounded-2xl bg-rose-50 p-4 text-center">
                  <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Discount value</p>
                  <p className="mt-3 text-2xl font-semibold text-rose-900">₹{Math.round(couponCampaigns.totalDiscountValue || 0)}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-rose-800">Coupon campaign performance</p>
                  {notifications.some((notification) => !notification.read) && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                {couponCampaignLoading ? (
                  <p className="text-sm text-gray-500">Loading coupon analytics...</p>
                ) : couponCampaigns.items.length === 0 ? (
                  <p className="text-sm text-gray-500">No coupon redemptions yet.</p>
                ) : couponCampaigns.items.map((campaign) => (
                  <div key={campaign._id || campaign.code} className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-rose-800">{campaign.code} · {campaign.discount}%</p>
                        <p className="text-sm text-gray-600">{campaign.description || 'No description'}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {campaign.active ? 'Active' : 'Inactive'} · {campaign.bookings} redemptions
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span>Used {campaign.usedCount}/{campaign.usageLimit}</span>
                      <span>Total saved: ₹{Math.round(campaign.totalDiscount || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {coupons.length === 0 ? <p className="text-sm text-gray-500">No coupons yet.</p> : coupons.map((c) => (
                <div key={c._id} className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-white p-3">
                  <div>
                    <p className="font-semibold text-rose-800">{c.code} · {c.discount}%</p>
                    <p className="text-sm text-gray-600">{c.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleCouponActive(c)} className={`rounded-full border px-3 py-2 text-sm ${c.active ? 'border-rose-700 bg-rose-700 text-white' : 'border-rose-200 bg-white text-rose-700'}`}>
                      {c.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDeleteCoupon(c._id)} className="rounded-full border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

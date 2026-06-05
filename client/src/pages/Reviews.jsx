import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ serviceId: '', rating: 5, title: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      const response = await api.get('/reviews', { params: { verified: 'true' } });
      setReviews(response.data);
    };
    const loadServices = async () => {
      const response = await api.get('/services');
      setServices(response.data);
    };
    loadReviews();
    loadServices();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reviews', form);
      setSubmitted(true);
      setForm({ serviceId: '', rating: 5, title: '', message: '' });
    } catch (error) {
      // error handled globally
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <p className="uppercase tracking-[0.3em] text-sm text-rose-700">Reviews</p>
        <h1 className="font-display text-5xl font-semibold text-rose-900">What brides are saying</h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">Verified reviews from real brides who experienced our luxury bridal makeup services.</p>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1.4fr,0.9fr]">
        <div aria-live="polite">
          <div className="flex flex-col gap-3 rounded-[36px] bg-rose-50 p-8 shadow-glass sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Average rating</p>
              <p className="mt-2 text-4xl font-semibold text-rose-900">{averageRating || 'No reviews yet'}</p>
            </div>
            <p className="text-sm text-gray-600">{reviews.length} verified review{reviews.length === 1 ? '' : 's'}</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {reviews.map((review) => (
              <article key={review._id} className="rounded-[32px] border border-rose-100 bg-white p-8 shadow-glass">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-rose-800">{review.customer?.name || 'Guest'}</p>
                    <p className="text-sm text-gray-500">{review.service?.name}</p>
                  </div>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">Verified</span>
                </div>
                <p className="mt-4 text-sm text-rose-700">{Array(review.rating).fill('★').join('')}</p>
                <h3 className="mt-4 text-lg font-semibold text-rose-800">{review.title}</h3>
                <p className="mt-3 text-gray-600">"{review.message}"</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[36px] bg-white p-8 shadow-glass">
          {user ? (
            <>
              <h2 className="text-3xl font-semibold text-rose-800">Share your review</h2>
              <p className="mt-2 text-gray-600">Help other brides by sharing your experience. Admins will verify reviews before they appear publicly.</p>
              {submitted && <p className="mt-4 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700" role="status">Thank you! Your review is submitted for verification.</p>}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="reviewService" className="block text-sm font-medium text-gray-700">Service</label>
                  <select
                    id="reviewService"
                    value={form.serviceId}
                    onChange={(event) => handleChange('serviceId', event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-rose-200 bg-cream p-4 text-sm outline-none focus:border-rose-400"
                  >
                    <option value="">Select service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>{service.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="reviewTitle" className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    id="reviewTitle"
                    type="text"
                    value={form.title}
                    onChange={(event) => handleChange('title', event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-rose-200 bg-cream p-4 text-sm outline-none focus:border-rose-400"
                  />
                </div>
                <fieldset className="space-y-2">
                  <legend className="block text-sm font-medium text-gray-700">Rating</legend>
                  <select
                    id="reviewRating"
                    value={form.rating}
                    onChange={(event) => handleChange('rating', Number(event.target.value))}
                    className="mt-2 w-full rounded-3xl border border-rose-200 bg-cream p-4 text-sm outline-none focus:border-rose-400"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>{'★'.repeat(value)}{'☆'.repeat(5 - value)}</option>
                    ))}
                  </select>
                </fieldset>
                <div>
                  <label htmlFor="reviewMessage" className="block text-sm font-medium text-gray-700">Review</label>
                  <textarea
                    id="reviewMessage"
                    value={form.message}
                    onChange={(event) => handleChange('message', event.target.value)}
                    rows="5"
                    className="mt-2 w-full rounded-3xl border border-rose-200 bg-cream p-4 text-sm outline-none focus:border-rose-400"
                  />
                </div>
                <button type="submit" disabled={submitting} className="w-full rounded-full bg-rose-700 px-6 py-4 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Submit review'}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-rose-800">Leave a review</h2>
              <p className="text-gray-600">Please sign in to submit your opinion and help our bridal community.</p>
              <Link to="/login" className="inline-flex rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800">Sign in to review</Link>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

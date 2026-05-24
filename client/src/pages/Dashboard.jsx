import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/bookings').then((response) => setBookings(response.data));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[40px] bg-white p-10 shadow-glass">
          <h1 className="font-display text-4xl font-semibold text-rose-800">Welcome back, {user?.name}</h1>
          <p className="mt-4 text-gray-600">Your bridal beauty appointments and active reservations are ready to view.</p>
          <div className="mt-10 space-y-6">
            <div className="rounded-[32px] border border-rose-100 bg-rose-50 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Profile</p>
              <h2 className="mt-3 text-2xl font-semibold text-rose-900">{user?.name}</h2>
              <p className="mt-2 text-gray-600">{user?.email}</p>
            </div>
            <div className="rounded-[32px] border border-rose-100 bg-white p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Upcoming appointments</p>
              <div className="mt-4 space-y-4">
                {bookings.length === 0 ? (
                  <p className="text-gray-500">No bookings yet.</p>
                ) : bookings.map((booking) => (
                  <div key={booking._id} className="rounded-3xl border border-rose-100 bg-cream p-4">
                    <p className="font-semibold text-rose-800">{booking.package || booking.service?.name}</p>
                    {booking.package && (
                      <p className="text-sm text-gray-600">Service: {booking.service?.name}</p>
                    )}
                     <p className="mt-2 text-sm text-gray-600">Package fee: ₹{booking.packagePrice ?? booking.amount}</p>
                    {booking.package && (
                      <p className="text-sm text-gray-600">Included service value: ₹{booking.servicePrice}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-600">{new Date(booking.date).toLocaleDateString()} · {booking.timeSlot}</p>
                     <p className="mt-2 text-sm text-gray-500">Status: {booking.derivedStatus || booking.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <aside className="rounded-[40px] bg-rose-50 p-10 shadow-glass">
          <h2 className="font-semibold text-2xl text-rose-700">Your portal</h2>
          <p className="mt-4 text-gray-600">Manage your bookings, payment records, and upcoming bridal appointments from one elegant place.</p>
          <div className="mt-8 space-y-4 text-gray-600">
            <p>• Update profile details</p>
            <p>• View booking history</p>
            <p>• Download invoices</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

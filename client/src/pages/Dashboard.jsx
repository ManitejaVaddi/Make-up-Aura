import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [savedPaymentInfo, setSavedPaymentInfo] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(null);

  useEffect(() => {
    api.get('/bookings').then((response) => setBookings(response.data));
    api.get('/payments/saved').then((response) => setSavedPaymentInfo(response.data)).catch(() => setSavedPaymentInfo(null));
  }, []);

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const refreshBookings = async () => {
    const response = await api.get('/bookings');
    setBookings(response.data);
  };

  const reviewCoupons = bookings.filter((booking) => booking.feedbackCouponCode);
  const latestReviewCoupon = reviewCoupons.length > 0 ? reviewCoupons[reviewCoupons.length - 1].feedbackCouponCode : null;

  const handlePayBalance = async (booking) => {
    if (!booking || booking.amountDue <= 0) return;
    setPaymentLoading(booking._id);

    try {
      const orderResponse = await api.post('/payments/order', {
        bookingId: booking._id,
        savePaymentMethod: savedPaymentInfo?.paymentMethods?.length > 0
      });

      if (orderResponse.data.fallback) {
        alert(orderResponse.data.message || 'Payment completed in development mode.');
        await refreshBookings();
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Unable to load the payment gateway.');
        return;
      }

      // Confirm amount with the user before opening the payment gateway
      try {
        const amountNow = Number(orderResponse.data.amount || 0);
        const ok = window.confirm(`You will be charged ₹${amountNow.toFixed(2)} now. Proceed to payment?`);
        if (!ok) return;
      } catch (e) {
        // ignore and continue
      }

      const options = {
        key: orderResponse.data.key,
        amount: orderResponse.data.amount * 100,
        currency: orderResponse.data.currency,
        name: 'Bridal Aura',
        description: `Balance payment for ${booking.package || booking.service?.name}`,
        order_id: orderResponse.data.orderId,
        handler: async (response) => {
          await api.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentId: orderResponse.data.paymentId
          });
          await refreshBookings();
          alert('Payment successful and your booking has been updated.');
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: { color: '#be185d' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert('Unable to process payment right now.');
    } finally {
      setPaymentLoading(null);
    }
  };

  const downloadInvoice = async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/invoice?format=pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Unable to download invoice right now.');
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[40px] bg-white p-10 shadow-glass">
          <h1 className="font-display text-4xl font-semibold text-rose-800">Welcome back, {user?.name}</h1>
          <p className="mt-4 text-gray-600">Your bridal beauty appointments and active reservations are ready to view.</p>
          <div className="mt-10 space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-[32px] border border-rose-100 bg-rose-50 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Profile</p>
                <h2 className="mt-3 text-2xl font-semibold text-rose-900">{user?.name}</h2>
                <p className="mt-2 text-gray-600">{user?.email}</p>
                {savedPaymentInfo?.paymentMethods?.length ? (
                  <p className="mt-4 text-sm text-gray-700">Saved payment: {savedPaymentInfo.paymentMethods[0].network} ending {savedPaymentInfo.paymentMethods[0].last4}</p>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">No saved payment method yet.</p>
                )}
              </div>
              <div className="rounded-[32px] border border-rose-100 bg-white p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Payment status</p>
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <p>Total bookings: <span className="font-semibold text-rose-800">{bookings.length}</span></p>
                  <p>Pending payments: <span className="font-semibold text-rose-800">{bookings.filter((b) => (b.amountDue ?? (b.amount - (b.paidAmount || 0))) > 0 && b.status !== 'cancelled').length}</span></p>
                  <p>Total balance due: <span className="font-semibold text-rose-800">₹{bookings.reduce((sum, b) => sum + ((b.amountDue ?? (b.amount - (b.paidAmount || 0))) > 0 && b.status !== 'cancelled' ? (b.amountDue ?? (b.amount - (b.paidAmount || 0))) : 0), 0).toFixed(2)}</span></p>
                </div>
              </div>
              <div className="rounded-[32px] border border-rose-100 bg-white p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Booking health</p>
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <p>Confirmed bookings: <span className="font-semibold text-rose-800">{bookings.filter((b) => b.derivedStatus === 'confirmed' || b.status === 'confirmed').length}</span></p>
                  <p>Completed bookings: <span className="font-semibold text-rose-800">{bookings.filter((b) => b.derivedStatus === 'completed').length}</span></p>
                  <p>Cancelled bookings: <span className="font-semibold text-rose-800">{bookings.filter((b) => b.status === 'cancelled').length}</span></p>
                </div>
              </div>
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
                    <p className="mt-2 text-sm text-gray-600">Total amount: ₹{booking.amount}</p>
                    <p className="text-sm text-gray-600">Paid: ₹{booking.paidAmount ?? 0}</p>
                    <p className="text-sm text-gray-600">Balance due: ₹{((booking.amountDue ?? (booking.amount - (booking.paidAmount || 0))) || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Payment state: <span className="font-semibold text-rose-800">{booking.paymentStatus || 'unpaid'}</span></p>
                    {booking.package && (
                      <p className="text-sm text-gray-600">Included service value: ₹{booking.servicePrice}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-600">{new Date(booking.date).toLocaleDateString()} · {booking.timeSlot}</p>
                    <p className="mt-2 text-sm text-gray-500">Status: {booking.derivedStatus || booking.status}</p>
                    {booking.feedbackCouponCode ? (
                      <div className="mt-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                        Review request sent. Use coupon <span className="font-semibold">{booking.feedbackCouponCode}</span> for 15% off your next booking.
                      </div>
                    ) : booking.derivedStatus === 'completed' ? (
                      <div className="mt-3 rounded-3xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800">
                        Your appointment is complete. A review invitation with a thank-you coupon will be sent shortly.
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-3">
                      {((booking.amountDue ?? (booking.amount - (booking.paidAmount || 0))) || 0) > 0 && booking.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handlePayBalance(booking)}
                          disabled={paymentLoading === booking._id}
                          className="inline-flex items-center rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {paymentLoading === booking._id ? 'Processing...' : 'Pay balance'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => downloadInvoice(booking._id)}
                        className="inline-flex items-center rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        Download PDF invoice
                      </button>
                    </div>
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
          {latestReviewCoupon ? (
            <div className="mt-8 rounded-[32px] border border-rose-100 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Review reward</p>
              <h3 className="mt-3 text-xl font-semibold text-rose-800">Thank you for your booking</h3>
              <p className="mt-2 text-gray-600">Your feedback coupon is ready. Use code <span className="font-semibold text-rose-900">{latestReviewCoupon}</span> for 15% off your next appointment.</p>
              <Link to="/reviews" className="mt-4 inline-flex rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-800">Leave a review</Link>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

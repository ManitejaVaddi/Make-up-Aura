import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { packages } from '../data/packages.js';

const schema = z.object({
  serviceId: z.string().min(1),
  date: z.string().min(1),
  timeSlot: z.string().min(1),
  notes: z.string().optional(),
  packageName: z.string().optional()
});

const slots = ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Booking() {
  const [services, setServices] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingSummary, setBookingSummary] = useState(null);
  const [searchParams] = useSearchParams();
  const packageName = searchParams.get('package');
  const selectedPackage = packageName ? packages.find((pkg) => pkg.title === packageName) : null;
  const { user } = useAuth();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { packageName: packageName || '' }
  });
  const selectedServiceId = watch('serviceId');
  const selectedService = useMemo(() => services.find((service) => service._id === selectedServiceId), [services, selectedServiceId]);

  useEffect(() => {
    api.get('/services').then((response) => {
      setServices(response.data);
      if (selectedPackage) {
        const matched = response.data.find((service) => service.name === selectedPackage.serviceName);
        if (matched) {
          setValue('serviceId', matched._id);
        }
      }
    });
  }, [selectedPackage, setValue]);

  const handleBooking = async (data) => {
    const bookingResponse = await api.post('/bookings', data);
    const orderResponse = await api.post('/payments/order', { bookingId: bookingResponse.data._id });

    const summary = {
      amount: bookingResponse.data.amount,
      packageName: bookingResponse.data.package,
      packagePrice: bookingResponse.data.packagePrice,
      servicePrice: bookingResponse.data.servicePrice,
      serviceName: selectedService?.name
    };

    if (orderResponse.data.fallback) {
      setBookingSuccess(orderResponse.data.message || 'Booking confirmed without payment in development mode.');
      setBookingSummary(summary);
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) return alert('Unable to load payment gateway');

    const options = {
      key: orderResponse.data.key,
      amount: orderResponse.data.amount * 100,
      currency: orderResponse.data.currency,
      name: 'Bridal Aura',
      description: `Payment for ${selectedService?.name}`,
      order_id: orderResponse.data.orderId,
      handler: async (response) => {
        await api.post('/payments/verify', {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          paymentId: orderResponse.data.paymentId
        });
        setBookingSuccess('Your booking is confirmed and payment is complete.');
        setBookingSummary(summary);
      },
      prefill: {
        name: user?.name,
        email: user?.email
      },
      theme: { color: '#be185d' }
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-[0.9fr,0.7fr]">
        <div className="rounded-[36px] bg-white p-10 shadow-glass">
          <h1 className="font-display text-4xl font-semibold text-rose-800">Book your bridal makeup experience</h1>
          <p className="mt-4 text-gray-600">Select a premium service, choose your date and time, then pay securely online.</p>
          <form onSubmit={handleSubmit(handleBooking)} className="mt-10 space-y-6">
            {selectedPackage && (
              <div className="rounded-3xl bg-rose-50 p-4 text-rose-700">
                <p className="text-sm uppercase tracking-[0.2em] text-rose-600">Selected package</p>
                <p className="mt-2 text-lg font-semibold">{selectedPackage.title}</p>
                <div className="mt-2 space-y-2 text-sm text-gray-600">
                  <p>Package fee: <span className="font-semibold">₹{selectedPackage.price}</span></p>
                  <p>Service fee: <span className="font-semibold">₹{selectedPackage.servicePrice}</span></p>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  {selectedPackage.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-gray-500">The package fee above is the total amount you will pay. The service fee is the underlying service included in this package.</p>
              </div>
            )}
            <input type="hidden" value={packageName || ''} {...register('packageName')} />
            <label className="block text-sm text-gray-700">
              Service
              <select {...register('serviceId')} className="mt-2 w-full rounded-3xl border border-rose-200 bg-cream p-4 text-sm outline-none focus:border-rose-400">
                <option value="">Choose service</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>{service.name} - ₹{service.price}</option>
                ))}
              </select>
              {errors.serviceId && <span className="text-sm text-rose-600">Choose a service</span>}
            </label>
            <label className="block text-sm text-gray-700">
              Date
              <input type="date" {...register('date')} className="mt-2 w-full rounded-3xl border border-rose-200 bg-cream p-4 text-sm outline-none focus:border-rose-400" />
              {errors.date && <span className="text-sm text-rose-600">Choose a date</span>}
            </label>
            <label className="block text-sm text-gray-700">
              Time slot
              <select {...register('timeSlot')} className="mt-2 w-full rounded-3xl border border-rose-200 bg-cream p-4 text-sm outline-none focus:border-rose-400">
                <option value="">Choose slot</option>
                {slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
              </select>
              {errors.timeSlot && <span className="text-sm text-rose-600">Choose a time slot</span>}
            </label>
            <label className="block text-sm text-gray-700">
              Notes
              <textarea {...register('notes')} rows="4" placeholder="Any specific requests or bridal preferences" className="mt-2 w-full rounded-3xl border border-rose-200 bg-cream p-4 text-sm outline-none focus:border-rose-400" />
            </label>
            <button type="submit" className="w-full rounded-full bg-rose-700 px-6 py-4 text-sm font-semibold text-white transition hover:bg-rose-800">
              Reserve & Pay Securely
            </button>
          </form>
          {bookingSuccess && (
            <div className="mt-6 rounded-3xl bg-rose-50 p-5 text-rose-700">
              <p>{bookingSuccess}</p>
              {bookingSummary && (
                <div className="mt-4 rounded-3xl bg-white p-4 text-rose-800">
                  <p className="font-semibold">Booking summary</p>
                  <p className="mt-2 text-sm text-gray-600">Service: {bookingSummary.serviceName}</p>
                  {bookingSummary.packageName && (
                    <>
                      <p className="text-sm text-gray-600">Package: {bookingSummary.packageName}</p>
                      <p className="text-sm text-gray-600">Package fee: ₹{bookingSummary.packagePrice}</p>
                      <p className="text-sm text-gray-600">Service fee: ₹{bookingSummary.servicePrice}</p>
                    </>
                  )}
                  <p className="mt-2 text-sm text-gray-600">Total paid: ₹{bookingSummary.amount}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <aside className="rounded-[36px] bg-rose-50 p-10 shadow-glass">
          <h2 className="font-display text-3xl font-semibold text-rose-800">Booking details</h2>
          <p className="mt-4 text-gray-600">We support instant payment verification and secure Razorpay checkout for a premium booking experience.</p>
          {(selectedPackage || selectedService) && (
            <div className="mt-8 rounded-[28px] border border-rose-100 bg-white p-6">
              {selectedPackage ? (
                <>
                  <h3 className="text-xl font-semibold text-rose-700">Selected package</h3>
                  <p className="mt-4 text-lg font-semibold text-rose-800">{selectedPackage.title}</p>
                  <p className="mt-2 text-gray-600">Package fee: ₹{selectedPackage.price}</p>
                  <p className="mt-2 text-gray-600">Service fee: ₹{selectedPackage.servicePrice}</p>
                  <p className="mt-4 text-sm text-gray-500">This package will be fulfilled by the selected service below.</p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-rose-700">Selected service</h3>
                  <p className="mt-4 text-lg font-semibold text-rose-800">{selectedService.name}</p>
                  <p className="mt-2 text-gray-600">₹{selectedService.price} · {selectedService.duration} mins</p>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

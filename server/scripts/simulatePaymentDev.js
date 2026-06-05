import axios from 'axios';
import fs from 'fs';

const BASE = process.env.BASE || 'http://localhost:5000/api';

async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function main(){
  try{
    console.log('Using base URL', BASE);
    const rand = Math.floor(Math.random()*100000);
    const email = `devuser+${rand}@example.com`;
    const password = 'Password123!';
    console.log('Registering user', email);
    await axios.post(`${BASE}/auth/register`, { name: 'Dev User', email, password });
    console.log('Logging in');
    const login = await axios.post(`${BASE}/auth/login`, { email, password });
    const token = login.data.token || login.data.accessToken || login.headers['x-auth-token'] || (login.data && login.data.user && login.data.user.token);
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('Token present?', Boolean(token));

    console.log('Fetching services');
    const servicesRes = await axios.get(`${BASE}/services`);
    if (!servicesRes.data || servicesRes.data.length === 0) return console.error('No services available to book');
    const service = servicesRes.data[0];
    console.log('Selected service', service.name, 'id', service._id);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0,10);

    console.log('Creating booking for', dateStr, '10:00 AM');
    const bookingRes = await axios.post(`${BASE}/bookings`, {
      serviceId: service._id,
      date: dateStr,
      timeSlot: '10:00 AM',
      notes: 'Dev mode booking',
      depositPercent: 50
    }, { headers: authHeader });

    const booking = bookingRes.data;
    console.log('Booking created:', booking._id, 'amount', booking.amount, 'deposit', booking.depositAmount);

    console.log('Creating payment order (dev-mode expected)');
    const orderRes = await axios.post(`${BASE}/payments/order`, { bookingId: booking._id }, { headers: authHeader });
    console.log('Order response:', orderRes.data);

    if (orderRes.data.fallback) {
      console.log('Dev-mode payment applied. Verifying booking...');
      await sleep(500);
      const refreshed = await axios.get(`${BASE}/bookings`, { headers: authHeader });
      const myBooking = refreshed.data.find(b => b._id === booking._id);
      console.log('Refreshed booking paidAmount:', myBooking.paidAmount, 'paymentStatus:', myBooking.paymentStatus);
      // Download invoice HTML
      try {
        const inv = await axios.get(`${BASE}/bookings/${booking._id}/invoice`, { headers: authHeader, responseType: 'arraybuffer' });
        const outPath = `invoice_${booking._id}.html`;
        fs.writeFileSync(outPath, inv.data);
        console.log('Invoice saved to', outPath);
      } catch (e) {
        console.error('Invoice download failed:', e.response ? e.response.status : e.message);
      }
      return;
    }

    console.log('Razorpay configured on server; manual test required. Order details:', orderRes.data);
  } catch (err) {
    if (err.response) console.error('Error:', err.response.status, err.response.data);
    else console.error(err.message);
    process.exit(1);
  }
}

main();

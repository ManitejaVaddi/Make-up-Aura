import { loadEnv } from '../utils/loadEnv.js';
import { connectDatabase } from '../config/db.js';
import Booking from '../models/bookingModel.js';
import User from '../models/userModel.js';
import Service from '../models/serviceModel.js';
import { sendEmail } from '../config/mailer.js';
import { sendSmsIfConfigured } from '../utils/communication.js';

loadEnv();

async function main() {
  await connectDatabase();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const nextDay = new Date(tomorrow);
  nextDay.setDate(nextDay.getDate() + 1);

  console.log('Looking for confirmed bookings between', tomorrow, 'and', nextDay);

  const bookings = await Booking.find({
    date: { $gte: tomorrow, $lt: nextDay },
    status: 'confirmed'
  }).populate('customer').populate('service');

  console.log('Found', bookings.length, 'bookings');

  for (const booking of bookings) {
    try {
      if (booking.customer?.email) {
        await sendEmail({
          to: booking.customer.email,
          subject: 'Reminder: Your Bridal Appointment Tomorrow',
          html: `
            <div style="font-family:Arial,sans-serif;color:#3b3b3b;line-height:1.6;">
              <h1 style="color:#d946ef;">Beautiful Reminder</h1>
              <p>Hi ${booking.customer.name},</p>
              <p>This is a gentle reminder for your bridal makeup appointment tomorrow for <strong>${booking.service.name}</strong>.</p>
              <p><strong>Date:</strong> ${booking.date.toDateString()}</p>
              <p><strong>Time:</strong> ${booking.timeSlot}</p>
              <p>We can’t wait to make you glow.</p>
            </div>
          `
        });
        console.log('Email sent to', booking.customer.email);
      }
      if (booking.customer?.phone) {
        const ok = await sendSmsIfConfigured(booking.customer.phone, `Reminder: your bridal makeup appointment for ${booking.service.name} is tomorrow at ${booking.timeSlot}.`);
        console.log('SMS send attempted to', booking.customer.phone, 'ok=', ok);
      }
    } catch (e) {
      console.error('Failed sending reminder for booking', booking._id, e.message || e);
    }
  }

  console.log('Reminder run complete');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });

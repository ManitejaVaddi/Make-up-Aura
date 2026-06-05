import cron from 'node-cron';
import Booking from '../models/bookingModel.js';
import { sendEmail } from '../config/mailer.js';
import User from '../models/userModel.js';
import { sendSmsIfConfigured } from '../utils/communication.js';

export function startReminderJob() {
  cron.schedule('0 8 * * *', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookings = await Booking.find({
      date: { $gte: tomorrow, $lt: nextDay },
      status: 'confirmed'
    }).populate('customer').populate('service');

    for (const booking of bookings) {
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
      }
      if (booking.customer?.phone) {
        await sendSmsIfConfigured(booking.customer.phone, `Reminder: your bridal makeup appointment for ${booking.service.name} is tomorrow at ${booking.timeSlot}.`);
      }
    }
  }, { timezone: 'Asia/Kolkata' });
}

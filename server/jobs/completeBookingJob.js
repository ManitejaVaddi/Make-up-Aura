import cron from 'node-cron';
import Booking from '../models/bookingModel.js';
import Coupon from '../models/couponModel.js';
import { sendEmail } from '../config/mailer.js';
import { sendSmsIfConfigured } from '../utils/communication.js';
import { reviewRequestEmail } from '../utils/emailTemplates.js';

function parseEndTime(booking) {
  if (!booking.date || !booking.timeSlot) return null;
  try {
    const [hourMin, meridiem] = booking.timeSlot.split(' ');
    const [hh, mm] = hourMin.split(':').map(Number);
    let hours = hh % 12;
    if ((meridiem || '').toUpperCase() === 'PM') hours += 12;
    const end = new Date(booking.date);
    end.setHours(hours, mm || 0, 0, 0);
    const duration = booking.service?.duration || 60;
    return new Date(end.getTime() + duration * 60000);
  } catch (error) {
    return null;
  }
}

export function startCompleteBookingJob() {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const bookings = await Booking.find({ status: { $in: ['pending', 'confirmed'] } })
        .populate('service')
        .populate('customer');
      const now = new Date();

      const completedBookings = [];
      for (const booking of bookings) {
        const endedAt = parseEndTime(booking);
        if (endedAt && endedAt < now) {
          completedBookings.push(booking);
        }
      }

      for (const booking of completedBookings) {
        try {
          const update = { status: 'completed' };
          if (!booking.feedbackRequestSent) {
            const couponCode = `THANKYOU-${booking._id.toString().slice(-6).toUpperCase()}`;
            const coupon = await Coupon.create({
              code: couponCode,
              discount: 15,
              description: 'Thank you for your feedback. Enjoy 15% off your next booking.',
              expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
              usageLimit: 1,
              active: true
            });
            if (booking.customer?.email) {
              await sendEmail({
                to: booking.customer.email,
                subject: 'Thanks for your appointment — review and save',
                html: reviewRequestEmail(booking.customer.name, booking, coupon.code)
              });
            }
            if (booking.customer?.phone) {
              await sendSmsIfConfigured(
                booking.customer.phone,
                `Thanks for your appointment with Bridal Aura! Leave a review and use code ${coupon.code} for 15% off your next service.`
              );
            }
            update.feedbackRequestSent = true;
            update.feedbackCouponCode = coupon.code;
          }

          await Booking.updateOne({ _id: booking._id }, { $set: update });
        } catch (jobError) {
          console.error('Feedback job failed for booking', booking._id, jobError);
        }
      }
    } catch (error) {
      console.error('CompleteBookingJob failed:', error);
    }
  }, { timezone: 'Asia/Kolkata' });
}

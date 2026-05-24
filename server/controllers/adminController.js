import User from '../models/userModel.js';
import Booking from '../models/bookingModel.js';
import Service from '../models/serviceModel.js';
import Payment from '../models/paymentModel.js';

export async function getAdminDashboard(req, res, next) {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const totalServices = await Service.countDocuments();
    const payments = await Payment.find({ status: 'paid' });
    const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    res.json({ totalCustomers, totalBookings, confirmedBookings, totalServices, revenue });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await User.find().select('-password -refreshToken');
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function getBookingsAdmin(req, res, next) {
  try {
    const bookings = await Booking.find().populate('service').populate('customer', 'name email');

    const now = new Date();
    const mapped = bookings.map((booking) => {
      const b = booking.toObject();
      let endedAt = null;
      try {
        const [hourMin, meridiem] = b.timeSlot.split(' ');
        const [hh, mm] = hourMin.split(':').map(Number);
        let hours = hh % 12;
        if ((meridiem || '').toUpperCase() === 'PM') hours += 12;
        const start = new Date(b.date);
        start.setHours(hours, mm || 0, 0, 0);
        const duration = b.service?.duration || 60;
        endedAt = new Date(start.getTime() + duration * 60000);
      } catch (e) {
        endedAt = null;
      }

      let derivedStatus = b.status;
      if (derivedStatus !== 'cancelled' && endedAt && endedAt < now) {
        derivedStatus = 'completed';
      }

      return { ...b, derivedStatus, endedAt };
    });

    res.json(mapped);
  } catch (error) {
    next(error);
  }
}

export async function getRevenueReport(req, res, next) {
  try {
    const payments = await Payment.find({ status: 'paid' });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const report = payments.map((payment) => ({
      id: payment._id,
      booking: payment.booking,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt
    }));
    res.json({ totalRevenue, items: report });
  } catch (error) {
    next(error);
  }
}

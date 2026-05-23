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
    res.json(bookings);
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

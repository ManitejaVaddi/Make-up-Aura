import User from '../models/userModel.js';
import Booking from '../models/bookingModel.js';
import Service from '../models/serviceModel.js';
import Payment from '../models/paymentModel.js';
import Coupon from '../models/couponModel.js';
import Notification from '../models/notificationModel.js';

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

export async function getAdminNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ _id: { $in: req.user.notifications } }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    notification.read = true;
    await notification.save();
    res.json(notification);
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

export async function getCouponCampaigns(req, res, next) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    const pipeline = [
      { $match: { coupon: { $exists: true, $ne: null } } },
      { $project: { coupon: 1, basePrice: { $ifNull: ['$packagePrice', '$servicePrice'] }, amount: 1 } },
      { $addFields: { discountValue: { $subtract: ['$basePrice', '$amount'] } } },
      { $group: { _id: '$coupon', bookings: { $sum: 1 }, totalDiscount: { $sum: '$discountValue' } } },
      { $sort: { bookings: -1 } }
    ];

    const stats = await Booking.aggregate(pipeline);
    const couponMap = new Map(coupons.map((coupon) => [coupon._id.toString(), coupon]));

    const items = stats.map((stat) => {
      const coupon = couponMap.get(stat._id.toString());
      return {
        _id: stat._id,
        code: coupon?.code || 'UNKNOWN',
        description: coupon?.description || '',
        discount: coupon?.discount || 0,
        active: coupon?.active ?? false,
        usageLimit: coupon?.usageLimit ?? 0,
        usedCount: coupon?.usedCount ?? stat.bookings,
        bookings: stat.bookings,
        totalDiscount: stat.totalDiscount
      };
    });

    const totalCoupons = coupons.length;
    const totalRedemptions = stats.reduce((sum, stat) => sum + stat.bookings, 0);
    const totalDiscountValue = stats.reduce((sum, stat) => sum + stat.totalDiscount, 0);

    res.json({ totalCoupons, totalRedemptions, totalDiscountValue, items });
  } catch (error) {
    next(error);
  }
}

export async function getPopularPackages(req, res, next) {
  try {
    // aggregate bookings by package name or service name
    const Booking = (await import('../models/bookingModel.js')).default;
    const Service = (await import('../models/serviceModel.js')).default;

    const pipeline = [
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: { $ifNull: ['$package', '$service'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ];

    const raw = await Booking.aggregate(pipeline);

    // map results to readable items
    const items = await Promise.all(raw.map(async (r) => {
      if (typeof r._id === 'object' && r._id?.toString) {
        // service id
        const svc = await Service.findById(r._id);
        return { label: svc ? svc.name : r._id.toString(), count: r.count };
      }
      return { label: r._id || 'Unknown', count: r.count };
    }));

    res.json({ items });
  } catch (error) {
    next(error);
  }
}

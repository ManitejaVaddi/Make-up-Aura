import Booking from '../models/bookingModel.js';
import Service from '../models/serviceModel.js';
import Coupon from '../models/couponModel.js';
import { sendEmail } from '../config/mailer.js';
import { bookingConfirmationEmail } from '../utils/emailTemplates.js';
import { getPackageByName } from '../utils/packageData.js';

const timeSlots = ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];

export async function createBooking(req, res, next) {
  try {
    const user = req.user;
    const { serviceId, date, timeSlot, notes, couponCode, location, packageName } = req.validated;
    const service = await Service.findById(serviceId);
    if (!service || !service.availability) return res.status(404).json({ message: 'Service unavailable' });
    if (!timeSlots.includes(timeSlot)) return res.status(400).json({ message: 'Invalid time slot' });

    const bookingDate = new Date(date);
    const coupon = couponCode ? await Coupon.findOne({ code: couponCode.toUpperCase(), active: true }) : null;
    const selectedPackage = packageName ? getPackageByName(packageName) : null;
    const servicePrice = service.price;
    const packagePrice = selectedPackage ? selectedPackage.price : undefined;
    const baseAmount = selectedPackage ? packagePrice : servicePrice;
    const amount = coupon ? Math.round(baseAmount * (1 - coupon.discount / 100)) : baseAmount;

    const booking = await Booking.create({
      customer: user._id,
      service: service._id,
      date: bookingDate,
      timeSlot,
      notes,
      amount,
      servicePrice,
      packagePrice,
      location,
      coupon: coupon ? coupon._id : undefined,
      package: packageName
    });

    if (coupon) {
      coupon.usedCount += 1;
      if (coupon.usedCount >= coupon.usageLimit) coupon.active = false;
      await coupon.save();
    }

    await sendEmail({
      to: user.email,
      subject: 'Your bridal appointment is pending',
      html: bookingConfirmationEmail(
        user.name,
        service.name,
        bookingDate,
        timeSlot,
        amount,
        packageName,
        servicePrice,
        packagePrice
      )
    });

    res.status(201).json(booking);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Time slot already booked' });
    }
    next(error);
  }
}

export async function getBookings(req, res, next) {
  try {
    const { user } = req;
    const query = req.user.role === 'admin' ? {} : { customer: user._id };
    const bookings = await Booking.find(query).populate('service').populate('customer', 'name email');
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function getBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('service').populate('customer', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role !== 'admin' && booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

export async function updateBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const { status } = req.validated;
    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    next(error);
  }
}

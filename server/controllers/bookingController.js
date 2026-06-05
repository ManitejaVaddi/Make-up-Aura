import Booking from '../models/bookingModel.js';
import Service from '../models/serviceModel.js';
import Coupon from '../models/couponModel.js';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';
import PDFDocument from 'pdfkit';
import { sendEmail } from '../config/mailer.js';
import { bookingConfirmationEmail, adminAlertEmail } from '../utils/emailTemplates.js';
import { getPackageByName } from '../utils/packageData.js';

const timeSlots = ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];

export async function createBooking(req, res, next) {
  try {
    const user = req.user;
    const { serviceId, date, timeSlot, notes, couponCode, location, packageName, depositPercent } = req.validated;
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
    const normalizedDeposit = depositPercent || 0;
    const depositAmount = normalizedDeposit > 0 ? Math.round((amount * normalizedDeposit) / 100) : amount;

    const booking = await Booking.create({
      customer: user._id,
      service: service._id,
      date: bookingDate,
      timeSlot,
      notes,
      amount,
      paidAmount: 0,
      depositPercent: normalizedDeposit,
      depositAmount,
      paymentStatus: 'unpaid',
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

    const admins = await User.find({ role: 'admin' });
    const adminNotifications = await Notification.create(admins.map((admin) => ({
      user: admin._id,
      title: 'New booking created',
      message: `${user.name} booked ${service.name} for ${bookingDate.toLocaleDateString()} at ${timeSlot}.`,
      link: `/admin/bookings`,
      type: 'booking'
    })));
    if (adminNotifications.length > 0) {
      await User.updateMany({ role: 'admin' }, { $push: { notifications: { $each: adminNotifications.map((notification) => notification._id) } } });
    }
    for (const admin of admins) {
      if (admin.email) {
        await sendEmail({
          to: admin.email,
          subject: 'New booking received',
          html: adminAlertEmail(admin.name, 'New booking', booking, user)
        });
      }
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

    // Attach derived status, amount due and endedAt timestamp to each booking
    const mapped = bookings.map((booking) => {
      const b = booking.toObject();
      b.amountDue = (b.amount || 0) - (b.paidAmount || 0);
      const now = new Date();
      // parse timeSlot like '10:00 AM'
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

export async function getBookingInvoice(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('service')
      .populate('customer', 'name email')
      .populate('payment');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role !== 'admin' && booking.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const amountDue = booking.amount - booking.paidAmount;
    const receiptReference = booking.payment ? (booking.payment.receipt || booking.payment.orderId || booking.payment.paymentId || booking.payment._id) : 'N/A';
    const format = String(req.query.format || 'html').toLowerCase();

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice_${booking._id}.pdf"`);

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      doc.pipe(res);

      doc.fillColor('#be185d').fontSize(22).text('Bridal Aura Invoice', { align: 'left' });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#111');
      doc.text(`Invoice ID: ${booking._id}`);
      doc.text(`Customer: ${booking.customer.name} (${booking.customer.email})`);
      doc.text(`Service: ${booking.service.name}`);
      doc.text(`Date: ${new Date(booking.date).toLocaleDateString()}`);
      doc.text(`Time Slot: ${booking.timeSlot}`);
      doc.text(`Location: ${booking.location || 'N/A'}`);
      doc.text(`Package: ${booking.package || 'Standard'}`);
      doc.moveDown(1);

      doc.fontSize(14).fillColor('#be185d').text('Payment Summary');
      doc.moveDown(0.5);
      doc.fillColor('#111').fontSize(12);
      const addLine = (label, value) => {
        doc.font('Helvetica-Bold').text(label, { continued: true });
        doc.font('Helvetica').text(` ${value}`);
      };
      addLine('Total Booking Amount:', `₹${booking.amount.toFixed(2)}`);
      addLine('Paid Amount:', `₹${booking.paidAmount.toFixed(2)}`);
      addLine('Balance Due:', `₹${amountDue.toFixed(2)}`);
      addLine('Payment Status:', booking.paymentStatus);
      addLine('Booking Status:', booking.status);
      addLine('Deposit Option:', `${booking.depositPercent || 0}%`);
      addLine('Deposit Amount:', `₹${booking.depositAmount.toFixed(2)}`);
      addLine('Receipt Reference:', receiptReference);

      doc.moveDown(1.5);
      doc.fontSize(10).fillColor('#555').text('Thank you for booking with Bridal Aura. We look forward to making your day unforgettable.', { align: 'center' });
      doc.end();
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${booking._id}</title>
  <style>body{font-family:Arial,sans-serif;line-height:1.6;padding:24px;}h1{margin-bottom:0;}table{width:100%;border-collapse:collapse;margin-top:20px;}td,th{padding:8px;border:1px solid #ddd;}th{background:#f4f4f4;text-align:left;} .summary{margin-top:20px;} .total{font-weight:700;}</style>
</head>
<body>
  <h1>Booking Invoice</h1>
  <p><strong>Invoice ID:</strong> ${booking._id}</p>
  <p><strong>Customer:</strong> ${booking.customer.name} (${booking.customer.email})</p>
  <p><strong>Service:</strong> ${booking.service.name}</p>
  <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
  <p><strong>Time Slot:</strong> ${booking.timeSlot}</p>
  <p><strong>Location:</strong> ${booking.location || 'N/A'}</p>
  <p><strong>Package:</strong> ${booking.package || 'Standard'}</p>
  <table>
    <thead>
      <tr><th>Description</th><th>Amount</th></tr>
    </thead>
    <tbody>
      <tr><td>Total Booking Amount</td><td>₹${booking.amount.toFixed(2)}</td></tr>
      <tr><td>Paid Amount</td><td>₹${booking.paidAmount.toFixed(2)}</td></tr>
      <tr><td>Balance Due</td><td>₹${amountDue.toFixed(2)}</td></tr>
      <tr><td>Payment Status</td><td>${booking.paymentStatus}</td></tr>
      <tr><td>Booking Status</td><td>${booking.status}</td></tr>
    </tbody>
  </table>
  <div class="summary">
    <p><strong>Deposit Option:</strong> ${booking.depositPercent || 0}%</p>
    <p><strong>Deposit Amount:</strong> ₹${booking.depositAmount.toFixed(2)}</p>
    <p><strong>Receipt Reference:</strong> ${receiptReference}</p>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${booking._id}.html"`);
    res.send(html);
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('service').populate('customer', 'name email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const admins = await User.find({ role: 'admin' });
    const adminNotifications = await Notification.create(admins.map((admin) => ({
      user: admin._id,
      title: 'Booking cancelled',
      message: `${booking.customer.name} cancelled ${booking.service.name} scheduled for ${new Date(booking.date).toLocaleDateString()} at ${booking.timeSlot}.`,
      link: `/admin/bookings`,
      type: 'booking'
    })));
    if (adminNotifications.length > 0) {
      await User.updateMany({ role: 'admin' }, { $push: { notifications: { $each: adminNotifications.map((notification) => notification._id) } } });
    }
    for (const admin of admins) {
      if (admin.email) {
        await sendEmail({
          to: admin.email,
          subject: 'Booking cancelled',
          html: adminAlertEmail(admin.name, 'Booking cancelled', booking, booking.customer)
        });
      }
    }

    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    next(error);
  }
}

import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/paymentModel.js';
import Booking from '../models/bookingModel.js';

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

export async function createOrder(req, res, next) {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('service');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Cannot pay for a cancelled booking' });

    const amountInPaise = Math.round(booking.amount * 100);
    const razor = getRazorpayInstance();

    if (!razor) {
      const payment = await Payment.create({
        booking: booking._id,
        orderId: `dev_order_${booking._id}`,
        paymentId: `dev_payment_${booking._id}`,
        signature: 'dev_signature',
        amount: booking.amount,
        currency: 'INR',
        status: 'paid',
        receipt: `dev_receipt_${booking._id}`
      });

      booking.status = 'confirmed';
      booking.payment = payment._id;
      await booking.save();

      return res.json({
        fallback: true,
        message: 'Booking confirmed in development mode. Razorpay is not configured.',
        amount: booking.amount,
        currency: 'INR',
        paymentId: payment._id,
        orderId: payment.orderId
      });
    }

    const order = await razor.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${booking._id}`,
      payment_capture: 1
    });

    const payment = await Payment.create({
      booking: booking._id,
      orderId: order.id,
      amount: booking.amount,
      receipt: order.receipt,
      status: 'created'
    });

    res.json({ orderId: order.id, amount: booking.amount, currency: 'INR', paymentId: payment._id, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ message: 'Payment gateway not configured' });
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = 'paid';
    await payment.save();
    const booking = await Booking.findById(payment.booking);
    booking.status = 'confirmed';
    booking.payment = payment._id;
    await booking.save();

    res.json({ message: 'Payment verified', booking });
  } catch (error) {
    next(error);
  }
}

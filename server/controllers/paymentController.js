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

async function getOrCreateRazorpayCustomer(user, razor) {
  if (!user) return null;
  if (user.razorpayCustomerId) return user.razorpayCustomerId;
  const customer = await razor.customers.create({
    name: user.name,
    email: user.email,
    contact: user.phone || undefined
  });
  user.razorpayCustomerId = customer.id;
  await user.save();
  return customer.id;
}

function buildSavedPaymentMethod(payment) {
  if (!payment || payment.method !== 'card' || !payment.card) return null;
  return {
    provider: 'razorpay',
    methodId: payment.card.card_id || payment.id,
    type: payment.method,
    network: payment.card.network,
    last4: payment.card.last4,
    cardType: payment.card.type,
    expiry: `${payment.card.expiry_month}/${payment.card.expiry_year}`,
    createdAt: new Date()
  };
}

export async function createOrder(req, res, next) {
  try {
    const { bookingId, savePaymentMethod } = req.body;
    const booking = await Booking.findById(bookingId).populate('service');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Cannot pay for a cancelled booking' });

    const amountToCharge = booking.paidAmount > 0 ? Math.round((booking.amount - booking.paidAmount) * 100) : Math.round((booking.depositPercent > 0 ? booking.depositAmount : booking.amount) * 100);
    if (amountToCharge <= 0) {
      return res.status(400).json({ message: 'There is no pending amount to charge for this booking' });
    }
    // Safety: compute expected due and warn on mismatch between computed amount and booking due
    const expectedDueCents = Math.round((booking.amount - (booking.paidAmount || 0)) * 100);
    if (amountToCharge > expectedDueCents) {
      console.warn(`Payment createOrder: amountToCharge (${amountToCharge}) exceeds expected due (${expectedDueCents}) for booking ${booking._id}`);
    }
    const razor = getRazorpayInstance();

    if (!razor) {
      const payment = await Payment.create({
        booking: booking._id,
        orderId: `dev_order_${booking._id}`,
        paymentId: `dev_payment_${booking._id}`,
        signature: 'dev_signature',
        amount: amountToCharge / 100,
        currency: 'INR',
        status: 'paid',
        receipt: `dev_receipt_${booking._id}`
      });

      booking.paidAmount += amountToCharge / 100;
      booking.paymentStatus = booking.paidAmount >= booking.amount ? 'paid' : 'partial';
      booking.status = booking.paidAmount >= booking.amount ? 'confirmed' : 'pending';
      booking.payment = payment._id;
      await booking.save();

      return res.json({
        fallback: true,
        message: 'Booking confirmed in development mode. Razorpay is not configured.',
        amount: amountToCharge / 100,
        currency: 'INR',
        paymentId: payment._id,
        orderId: payment.orderId
      });
    }

    const customerId = await getOrCreateRazorpayCustomer(req.user, razor);
    const order = await razor.orders.create({
      amount: amountToCharge,
      currency: 'INR',
      receipt: `receipt_${booking._id}`,
      payment_capture: 1,
      notes: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
        savePaymentMethod: savePaymentMethod ? 'true' : 'false'
      }
    });

    const payment = await Payment.create({
      booking: booking._id,
      orderId: order.id,
      amount: amountToCharge / 100,
      receipt: order.receipt,
      status: 'created'
    });

    res.json({
      orderId: order.id,
      amount: amountToCharge / 100,
      currency: 'INR',
      paymentId: payment._id,
      key: process.env.RAZORPAY_KEY_ID,
      customerId
    });
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
    if (payment.status === 'paid') {
      // Idempotent handling: already processed
      console.info(`Payment verify: payment ${payment._id} already marked paid`);
      const bookingExists = await Booking.findById(payment.booking);
      return res.json({ message: 'Payment already verified', booking: bookingExists });
    }
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = 'paid';

    const razor = getRazorpayInstance();
    if (razor) {
      try {
        const razorPayment = await razor.payments.fetch(razorpay_payment_id);
        if (razorPayment?.customer_id && req.user && !req.user.razorpayCustomerId) {
          req.user.razorpayCustomerId = razorPayment.customer_id;
        }
        const methodSummary = buildSavedPaymentMethod(razorPayment);
        if (methodSummary && req.user) {
          const existing = (req.user.paymentMethods || []).find((m) => m.methodId === methodSummary.methodId);
          if (!existing) {
            req.user.paymentMethods = [...(req.user.paymentMethods || []), methodSummary];
          }
        }
        if (req.user) await req.user.save();
      } catch (error) {
        // ignore saving method details when subscription details aren't available
      }
    }

    await payment.save();
    const booking = await Booking.findById(payment.booking);
    // Safety: do not allow paidAmount to exceed booking.amount; clamp to max
    const priorPaid = booking.paidAmount || 0;
    let credit = Number(payment.amount || 0);
    const amountRemaining = Math.max(0, booking.amount - priorPaid);
    if (credit > amountRemaining) {
      console.warn(`Payment verify: payment amount ${credit} exceeds remaining due ${amountRemaining} for booking ${booking._id}. Clamping to remaining due.`);
      credit = amountRemaining;
    }
    booking.paidAmount = priorPaid + credit;
    booking.paymentStatus = booking.paidAmount >= booking.amount ? 'paid' : 'partial';
    booking.status = booking.paidAmount >= booking.amount ? 'confirmed' : 'pending';
    booking.payment = payment._id;
    await booking.save();

    res.json({ message: 'Payment verified', booking });
  } catch (error) {
    next(error);
  }
}

export async function getSavedPaymentMethods(req, res, next) {
  try {
    const { razorpayCustomerId, paymentMethods = [] } = req.user;
    res.json({ customerId: razorpayCustomerId, paymentMethods });
  } catch (error) {
    next(error);
  }
}

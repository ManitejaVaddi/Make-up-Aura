import Booking from '../models/bookingModel.js';
import BlockedSlot from '../models/blockedSlotModel.js';

const timeSlots = ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getSlots(req, res, next) {
  try {
    const { serviceId, date } = req.query;
    if (!serviceId || !date) return res.status(400).json({ message: 'serviceId and date required' });
    const start = startOfDay(date);
    const end = endOfDay(date);

    const bookings = await Booking.find({ service: serviceId, date: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } }).populate('customer', 'name email');
    const blocked = await BlockedSlot.find({ service: serviceId, date: { $gte: start, $lte: end } });

    const result = timeSlots.map((slot) => {
      const booked = bookings.find((b) => b.timeSlot === slot);
      const block = blocked.find((s) => s.timeSlot === slot);
      if (booked) return { timeSlot: slot, status: 'booked', bookingId: booked._id, customer: booked.customer };
      if (block) return { timeSlot: slot, status: 'blocked', blockedId: block._id, reason: block.reason };
      return { timeSlot: slot, status: 'available' };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function blockSlot(req, res, next) {
  try {
    const { serviceId, date, timeSlot, reason } = req.body;
    if (!serviceId || !date || !timeSlot) return res.status(400).json({ message: 'serviceId, date and timeSlot are required' });
    const start = startOfDay(date);
    const end = endOfDay(date);

    // ensure not already booked
    const existingBooking = await Booking.findOne({ service: serviceId, date: { $gte: start, $lte: end }, timeSlot, status: { $ne: 'cancelled' } });
    if (existingBooking) return res.status(409).json({ message: 'Slot already booked' });

    // check existing block
    const existingBlock = await BlockedSlot.findOne({ service: serviceId, date: { $gte: start, $lte: end }, timeSlot });
    if (existingBlock) return res.status(409).json({ message: 'Slot already blocked' });

    const blocked = await BlockedSlot.create({ service: serviceId, date: new Date(date), timeSlot, reason });
    res.status(201).json(blocked);
  } catch (error) {
    next(error);
  }
}

export async function unblockSlot(req, res, next) {
  try {
    const { id } = req.params;
    const block = await BlockedSlot.findById(id);
    if (!block) return res.status(404).json({ message: 'Blocked slot not found' });
    await block.remove();
    res.json({ message: 'Slot unblocked' });
  } catch (error) {
    next(error);
  }
}

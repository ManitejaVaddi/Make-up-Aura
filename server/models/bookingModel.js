import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    notes: { type: String },
    amount: { type: Number, required: true },
    servicePrice: { type: Number, required: true },
    packagePrice: { type: Number },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    package: { type: String },
    metadata: {
      location: String,
      artist: String
    }
  },
  { timestamps: true }
);

bookingSchema.index({ service: 1, date: 1, timeSlot: 1 }, { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;

import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discount: { type: Number, required: true, min: 1, max: 100 },
    description: { type: String },
    expiresAt: { type: Date },
    active: { type: Boolean, default: true },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;

import Coupon from '../models/couponModel.js';

export async function createCoupon(req, res, next) {
  try {
    const { code, discount, description, expiresAt, usageLimit } = req.body;
    const coupon = await Coupon.create({ code, discount, description, expiresAt: expiresAt ? new Date(expiresAt) : undefined, usageLimit: Number(usageLimit) || 100 });
    res.status(201).json(coupon);
  } catch (error) {
    next(error);
  }
}

export async function getCoupons(req, res, next) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    next(error);
  }
}

export async function updateCoupon(req, res, next) {
  try {
    const payload = req.body;
    const coupon = await Coupon.findByIdAndUpdate(req.params.couponId, payload, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    next(error);
  }
}

export async function deleteCoupon(req, res, next) {
  try {
    const coupon = await Coupon.findById(req.params.couponId);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    await coupon.remove();
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
}

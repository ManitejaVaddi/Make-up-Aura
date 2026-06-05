import Review from '../models/reviewModel.js';
import Service from '../models/serviceModel.js';

export async function createReview(req, res, next) {
  try {
    const { serviceId, rating, title, message, images } = req.validated;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    const review = await Review.create({
      customer: req.user._id,
      service: service._id,
      rating,
      title,
      message,
      images
    });
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}

export async function getReviews(req, res, next) {
  try {
    const query = {};
    if (req.query.serviceId) query.service = req.query.serviceId;
    if (req.query.verified === 'true') query.verified = true;
    const reviews = await Review.find(query).populate('customer', 'name avatar').populate('service', 'name');
    res.json(reviews);
  } catch (error) {
    next(error);
  }
}

export async function verifyReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.verified = true;
    await review.save();
    res.json(review);
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (req.user.role !== 'admin' && review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await review.remove();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
}

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    verified: { type: Boolean, default: false },
    images: [{ type: String }],
    reply: { type: String }
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;

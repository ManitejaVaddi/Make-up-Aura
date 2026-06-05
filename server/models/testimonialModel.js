import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    customerName: { type: String },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true },
    avatar: { type: String },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;

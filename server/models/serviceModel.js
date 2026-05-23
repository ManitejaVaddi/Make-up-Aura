import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    category: { type: String, enum: ['bridal', 'hd', 'party', 'fashion', 'engagement', 'photoshoot'], required: true },
    images: [{ type: String }],
    availability: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    galleryTags: [{ type: String }]
  },
  { timestamps: true }
);

const Service = mongoose.model('Service', serviceSchema);
export default Service;

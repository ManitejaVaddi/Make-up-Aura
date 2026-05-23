import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    mediaUrl: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    category: { type: String, enum: ['bridal', 'beforeAfter', 'editorial', 'engagement', 'fashion', 'events'], default: 'bridal' },
    tags: [{ type: String }],
    publicId: { type: String, required: true },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;

import cloudinary from '../config/cloudinary.js';
import Gallery from '../models/galleryModel.js';

export async function uploadGalleryMedia(req, res, next) {
  try {
    const { title, description, type, category, tags, mediaUrl } = req.body;
    if (!mediaUrl) {
      return res.status(400).json({ message: 'Media URL is required' });
    }
    const upload = await cloudinary.uploader.upload(mediaUrl, {
      folder: 'bridal-gallery',
      resource_type: type === 'video' ? 'video' : 'image'
    });
    const galleryItem = await Gallery.create({
      title,
      description,
      type,
      category,
      tags: tags ? tags.split(',').map((tag) => tag.trim().toLowerCase()) : [],
      mediaUrl: upload.secure_url,
      publicId: upload.public_id,
      featured: req.body.featured === 'true'
    });
    res.status(201).json(galleryItem);
  } catch (error) {
    next(error);
  }
}

export async function getGallery(req, res, next) {
  try {
    const query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.type) query.type = req.query.type;
    const gallery = await Gallery.find(query).sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    next(error);
  }
}

export async function deleteGalleryItem(req, res, next) {
  try {
    const item = await Gallery.findById(req.params.galleryId);
    if (!item) return res.status(404).json({ message: 'Gallery item not found' });
    await cloudinary.uploader.destroy(item.publicId, { resource_type: item.type === 'video' ? 'video' : 'image' });
    await item.remove();
    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    next(error);
  }
}

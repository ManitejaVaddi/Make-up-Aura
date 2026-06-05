import Testimonial from '../models/testimonialModel.js';

export async function createTestimonial(req, res, next) {
  try {
    const { customerName, rating, comment, avatar, featured } = req.body;
    const t = await Testimonial.create({ customerName, rating, comment, avatar, featured: Boolean(featured) });
    res.status(201).json(t);
  } catch (error) {
    next(error);
  }
}

export async function getTestimonials(req, res, next) {
  try {
    const query = {};
    if (req.query.featured) query.featured = req.query.featured === 'true';
    const items = await Testimonial.find(query).sort({ featured: -1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function deleteTestimonial(req, res, next) {
  try {
    const t = await Testimonial.findById(req.params.testimonialId);
    if (!t) return res.status(404).json({ message: 'Testimonial not found' });
    await t.remove();
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    next(error);
  }
}

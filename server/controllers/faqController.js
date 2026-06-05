import FAQ from '../models/faqModel.js';

export async function createFAQ(req, res, next) {
  try {
    const { question, answer, order, featured } = req.body;
    const faq = await FAQ.create({ question, answer, order: Number(order) || 0, featured: Boolean(featured) });
    res.status(201).json(faq);
  } catch (error) {
    next(error);
  }
}

export async function getFAQs(req, res, next) {
  try {
    const query = {};
    if (req.query.featured) query.featured = req.query.featured === 'true';
    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    next(error);
  }
}

export async function deleteFAQ(req, res, next) {
  try {
    const faq = await FAQ.findById(req.params.faqId);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    await faq.remove();
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    next(error);
  }
}

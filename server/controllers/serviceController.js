import Service from '../models/serviceModel.js';

export async function createService(req, res, next) {
  try {
    const payload = req.validated;
    const service = await Service.create(payload);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
}

export async function getServices(req, res, next) {
  try {
    const query = {};
    if (req.query.category) query.category = req.query.category;
    const services = await Service.find(query).sort({ featured: -1, createdAt: -1 });
    res.json(services);
  } catch (error) {
    next(error);
  }
}

export async function getService(req, res, next) {
  try {
    const service = await Service.findById(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    next(error);
  }
}

export async function updateService(req, res, next) {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.serviceId, req.validated, { new: true });
    if (!updated) return res.status(404).json({ message: 'Service not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteService(req, res, next) {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.serviceId);
    if (!deleted) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    next(error);
  }
}

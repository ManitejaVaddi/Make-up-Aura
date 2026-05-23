export const validateRequest = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      ...req.body,
      ...req.params,
      ...req.query
    });
    req.validated = parsed;
    next();
  } catch (error) {
    return res.status(400).json({ error: error.errors ? error.errors : error.message });
  }
};

import { ApiError } from '../utils/apiError.js';

export const validateRequest = (schema) => (req, res, next) => {
  try {
    if (schema.parse) {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed && parsed.body) {
        req.body = parsed.body;
      }
    }
    next();
  } catch (err) {
    if (err.errors) {
      const messages = err.errors.map((e) => e.message).join(', ');
      return next(ApiError.badRequest(messages));
    }
    next(err);
  }
};

export const validate = validateRequest;
